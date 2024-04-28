//SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// import "hardhat/console.sol";

contract SQRVesting is Ownable, ReentrancyGuard {
  using SafeERC20 for IERC20;

  //Variables, structs, errors, modifiers, events------------------------

  string public constant VERSION = "1.0";

  IERC20 public erc20Token;
  uint32 public startDate;
  uint32 public cliffPeriod;
  uint256 public firstUnlockPercent;
  uint32 public unlockPeriod;
  uint256 public unlockPeriodPercent;

  mapping(address => Allocation) public allocations;

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
  }

  event Claim(address indexed account, uint256 amount);
  event SetAllocation(address indexed account, uint256 amount);
  event WithdrawExcessAmount(address indexed to, uint256 amount);

  error ERC20TokenNotZeroAddress();
  error UnlockPeriodNotZero();
  error UnlockPeriodPercentNotZero();
  error StartDateMustBeGreaterThanCurrentTime();
  error UserStartedToClaim(address account);
  error ArrayLengthshNotEqual();
  error AccountNotZeroAddress();
  error ContractMustHaveSufficientFunds();
  error NothingToClaim();

  //Read methods-------------------------------------------

  function getBalance() public view returns (uint256) {
    return erc20Token.balanceOf(address(this));
  }

  function canClaim(address account) public view returns (bool) {
    return (calculateClaimAmount(account) > 0);
  }

  function calculatePassedPeriod() public view returns (uint32) {
    return ((uint32)(block.timestamp) - startDate - cliffPeriod) / unlockPeriod;
  }

  function calculateClaimAmount(address account) public view returns (uint256) {
    if (block.timestamp < startDate) {
      return 0;
    }

    uint256 firstUnlockAmount = (allocations[account].amount * firstUnlockPercent) /
      PERCENT_DIVIDER;

    Allocation storage allocation = allocations[account];

    uint256 claimed = allocation.claimed;
    uint256 amount = allocation.amount;

    if (block.timestamp < startDate + cliffPeriod) {
      if (claimed == 0) {
        return firstUnlockAmount;
      }
    } else {
      uint256 claimAmount = (calculatePassedPeriod() * (amount * unlockPeriodPercent)) /
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

  function calculateNextClaimAt(address account) public view returns (uint256) {
    if (canClaim(account) || isAllocationFinished(account)) {
      return 0;
    }

    if (allocations[account].claimed == 0) {
      return startDate;
    } else {
      if (block.timestamp - startDate < cliffPeriod) {
        return startDate + cliffPeriod + unlockPeriod;
      }

      uint256 passedPeriod = calculatePassedPeriod();
      return startDate + cliffPeriod + unlockPeriod * (passedPeriod + 1);
    }
  }

  function calculateRemainAmount(address wallet) public view returns (uint256) {
    return allocations[wallet].amount - allocations[wallet].claimed;
  }

  function fetchClaimInfo(
    address account
  )
    external
    view
    returns (
      uint256 allocation,
      uint256 claimed,
      uint256 remains,
      uint256 available,
      bool _canClaim,
      uint256 nextClaimAt
    )
  {
    return (
      allocations[account].amount,
      allocations[account].claimed,
      calculateRemainAmount(account),
      calculateClaimAmount(account),
      canClaim(account),
      calculateNextClaimAt(account)
    );
  }

  function getTotalAllocated() public view returns (uint256) {
    return totalAllocated;
  }

  function getRequiredAmount() public view returns (uint256) {
    return totalReserved;
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

    if (allocation.claimed > 0) {
      revert UserStartedToClaim(account);
    }

    totalAllocated -= allocation.amount;
    totalReserved -= allocation.amount;

    allocation.amount = amount;

    totalAllocated += amount;
    totalReserved += amount;

    _allocationCounter++;

    emit SetAllocation(account, amount);
  }

  function setAllocation(address account, uint256 amount) public onlyOwner {
    _setAllocation(account, amount);
  }

  function setAllocations(
    address[] calldata recepients,
    uint256[] calldata amounts
  ) external onlyOwner {
    if (recepients.length != amounts.length) {
      revert ArrayLengthshNotEqual();
    }

    for (uint32 i = 0; i < recepients.length; i++) {
      setAllocation(recepients[i], amounts[i]);
    }
  }

  function claim() external nonReentrant {
    address sender = _msgSender();
    uint256 claimAmount = calculateClaimAmount(sender);

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
