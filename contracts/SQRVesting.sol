//SPDX-License-Identifier: MIT
pragma solidity >=0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SQRVesting is Ownable, ReentrancyGuard {
  using SafeERC20 for IERC20;

  //Variables, structs, errors, modifiers, events------------------------

  string public constant VERSION = "1.1";

  IERC20 public erc20Token;
  uint32 public startDate;
  uint32 public cliffPeriod;
  uint256 public firstUnlockPercent;
  uint32 public unlockPeriod;
  uint256 public unlockPeriodPercent;

  mapping(address account => Allocation allocation) public allocations;

  uint256 public constant PERCENT_DIVIDER = 1e18 * 100;

  constructor(
    address _newOwner,
    address _erc20Token,
    uint32 _startDate,
    uint32 _cliffPeriod,
    uint256 _firstUnlockPercent,
    uint32 _unlockPeriod,
    uint256 _unlockPeriodPercent
  ) Ownable(_newOwner) {
    if (_erc20Token == address(0)) {
      revert ERC20TokenNotZeroAddress();
    }

    if (_firstUnlockPercent > PERCENT_DIVIDER) {
      revert FirstUnlockPercentMustBeLessThanPercentDivider();
    }

    if (_startDate < uint32(block.timestamp)) {
      revert StartDateMustBeGreaterThanCurrentTime();
    }

    if (_unlockPeriod == 0) {
      revert UnlockPeriodNotZero();
    }

    if (_unlockPeriodPercent == 0) {
      revert UnlockPeriodPercentNotZero();
    }

    erc20Token = IERC20(_erc20Token);
    startDate = _startDate;
    cliffPeriod = _cliffPeriod;
    firstUnlockPercent = _firstUnlockPercent;
    unlockPeriod = _unlockPeriod;
    unlockPeriodPercent = _unlockPeriodPercent;
  }

  uint32 private _allocationCounter;
  uint256 private totalReserved;
  uint256 private totalAllocated;

  struct Allocation {
    uint256 amount;
    uint256 claimed;
    uint32 claimedAt;
    bool exist;
  }

  struct ClaimInfo {
    uint256 amount;
    uint256 claimed;
    uint32 claimedAt;
    bool exist;
    bool canClaim;
    uint256 available;
    uint256 remain;
    uint256 nextAvailable;
    uint32 nextClaimAt;
  }

  event Claim(address indexed account, uint256 amount);
  event SetAllocation(address indexed account, uint256 amount);
  event WithdrawExcessAmount(address indexed to, uint256 amount);

  error ERC20TokenNotZeroAddress();
  error FirstUnlockPercentMustBeLessThanPercentDivider();
  error UnlockPeriodNotZero();
  error UnlockPeriodPercentNotZero();
  error StartDateMustBeGreaterThanCurrentTime();
  error ArrayLengthsNotEqual();
  error AccountNotZeroAddress();
  error ContractMustHaveSufficientFunds();
  error NothingToClaim();
  error CantChangeOngoingVesting();

  //Read methods-------------------------------------------

  function getBalance() public view returns (uint256) {
    return erc20Token.balanceOf(address(this));
  }

  function canClaim(address account) public view returns (bool) {
    return (calculateClaimAmount(account, 0) > 0);
  }

  function calculatePassedPeriod() public view returns (uint32) {
    uint32 timestamp = (uint32)(block.timestamp);
    if (timestamp > startDate + cliffPeriod) {
      return (timestamp - startDate - cliffPeriod) / unlockPeriod;
    }
    return 0;
  }

  function calculateMaxPeriod() public view returns (uint256) {
    return PERCENT_DIVIDER / unlockPeriodPercent;
  }

  function calculateFinishDate() public view returns (uint32) {
    return startDate + cliffPeriod + (uint32)(calculateMaxPeriod()) * unlockPeriod;
  }

  function calculateClaimAmount(
    address account,
    uint32 periodOffset
  ) public view returns (uint256) {
    if (block.timestamp < startDate && periodOffset == 0) {
      return 0;
    }

    Allocation memory allocation = allocations[account];

    uint256 firstUnlockAmount = (allocation.amount * firstUnlockPercent) / PERCENT_DIVIDER;
    uint256 claimed = allocation.claimed;
    uint256 amount = allocation.amount;

    if (block.timestamp < startDate + cliffPeriod) {
      if (claimed == 0) {
        return firstUnlockAmount;
      }
    } else {
      uint256 claimAmount = ((calculatePassedPeriod() + periodOffset) *
        (amount * unlockPeriodPercent)) /
        PERCENT_DIVIDER +
        firstUnlockAmount -
        claimed;

      if (claimAmount > amount - claimed) {
        return amount - claimed;
      }

      return claimAmount;
    }

    return 0;
  }

  function getAllocationCount() public view returns (uint32) {
    return _allocationCounter;
  }

  function isAllocationFinished(address account) public view returns (bool) {
    return (allocations[account].claimed == allocations[account].amount);
  }

  function calculateClaimAt(address account, uint32 periodOffset) public view returns (uint32) {
    if (isAllocationFinished(account)) {
      return 0;
    }

    if (allocations[account].claimed == 0) {
      return startDate;
    } else {
      if (block.timestamp - startDate < cliffPeriod) {
        return startDate + cliffPeriod + unlockPeriod;
      }

      uint32 passedPeriod = calculatePassedPeriod();
      return (uint32)(startDate + cliffPeriod + (passedPeriod + periodOffset) * unlockPeriod);
    }
  }

  function calculateRemainAmount(address wallet) public view returns (uint256) {
    return allocations[wallet].amount - allocations[wallet].claimed;
  }

  function fetchClaimInfo(address account) external view returns (ClaimInfo memory) {
    Allocation memory allocation = allocations[account];
    bool canClaim_ = canClaim(account);
    uint256 available = calculateClaimAmount(account, 0);
    uint256 remain = calculateRemainAmount(account);
    uint256 nextAvailable = calculateClaimAmount(account, 1);
    uint32 nextClaimAt = calculateClaimAt(account, 1);

    return
      ClaimInfo(
        allocation.amount,
        allocation.claimed,
        allocation.claimedAt,
        allocation.exist,
        canClaim_,
        available,
        remain,
        nextAvailable,
        nextClaimAt
      );
  }

  function getTotalAllocated() public view returns (uint256) {
    return totalAllocated;
  }

  function calculatedRequiredAmount() public view returns (uint256) {
    uint256 contractBalance = getBalance();
    if (totalReserved > contractBalance) {
      return totalReserved - contractBalance;
    }
    return 0;
  }

  function calculateExcessAmount() public view returns (uint256) {
    uint256 contractBalance = getBalance();
    if (contractBalance > totalReserved) {
      return contractBalance - totalReserved;
    }
    return 0;
  }

  //Write methods-------------------------------------------

  function _setAllocation(address account, uint256 amount) private nonReentrant {
    if (account == address(0)) {
      revert AccountNotZeroAddress();
    }

    Allocation storage allocation = allocations[account];

    if (!allocation.exist) {
      _allocationCounter++;
    }

    totalAllocated -= allocation.amount;
    totalReserved -= allocation.amount;

    allocation.amount = amount;
    allocation.exist = true;

    totalAllocated += amount;
    totalReserved += amount;

    emit SetAllocation(account, amount);
  }

  function setAllocation(address account, uint256 amount) public onlyOwner {
    if (block.timestamp > startDate) {
      revert CantChangeOngoingVesting();
    }

    _setAllocation(account, amount);
  }

  function setAllocations(
    address[] calldata recipients,
    uint256[] calldata amounts
  ) external onlyOwner {
    if (recipients.length != amounts.length) {
      revert ArrayLengthsNotEqual();
    }

    for (uint32 i = 0; i < recipients.length; i++) {
      setAllocation(recipients[i], amounts[i]);
    }
  }

  function claim() external nonReentrant {
    address sender = _msgSender();
    uint256 claimAmount = calculateClaimAmount(sender, 0);

    if (claimAmount == 0) {
      revert NothingToClaim();
    }

    if (getBalance() < claimAmount) {
      revert ContractMustHaveSufficientFunds();
    }

    allocations[sender].claimed += claimAmount;
    allocations[sender].claimedAt = (uint32)(block.timestamp);

    totalReserved -= claimAmount;

    erc20Token.safeTransfer(sender, claimAmount);

    emit Claim(sender, claimAmount);
  }

  function withdrawExcessAmount() external nonReentrant onlyOwner {
    uint256 amount = calculateExcessAmount();
    address to = owner();
    erc20Token.safeTransfer(to, amount);
    emit WithdrawExcessAmount(to, amount);
  }
}
