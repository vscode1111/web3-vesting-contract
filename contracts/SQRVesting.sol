//SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "hardhat/console.sol";

contract SQRVesting is Ownable, ReentrancyGuard {
  using SafeERC20 for IERC20;

  //Variables, structs, errors, modifiers, events------------------------

  string public constant VERSION = "1.0";

  IERC20 public erc20Token;
  uint256 public startDate;
  uint256 public cliffPeriod;
  uint256 public firstUnlockPercent;
  uint256 public unlockPeriod;
  uint256 public unlockPeriodPercent;

  struct Allocation {
    uint256 amount;
    uint256 claimed;
    uint256 claimedAt;
  }
  mapping(address => Allocation) public allocations;

  uint256 public constant PERCENT_DIVIDER = 1e18 * 100;

  constructor(
    address _newOwner,
    address _erc20Token,
    uint256 _startDate,
    uint256 _cliffPeriod,
    uint256 _firstUnlockPercent,
    uint256 _unlockPeriod,
    uint256 _unlockPeriodPercent
  ) Ownable(_newOwner) {
    //ToDo: add checks
    erc20Token = IERC20(_erc20Token);
    startDate = _startDate;
    cliffPeriod = _cliffPeriod;
    firstUnlockPercent = _firstUnlockPercent;
    unlockPeriod = _unlockPeriod;
    unlockPeriodPercent = _unlockPeriodPercent;
  }

  event Claim(address indexed account, uint256 amount);

  error NothingToClaim();

  //Read methods-------------------------------------------

  function getBalance() public view returns (uint256) {
    return erc20Token.balanceOf(address(this));
  }

  function canClaim(address account) public view returns (bool) {
    return (calculateClaimAmount(account) > 0);
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
      uint256 unlockAmount = (amount * unlockPeriodPercent) / PERCENT_DIVIDER;

      uint256 duration = block.timestamp - startDate - cliffPeriod;
      uint256 factor = duration / unlockPeriod;
      uint256 claimable = factor * unlockAmount + firstUnlockAmount - claimed;

      // console.log(100, unlockPeriod, duration, factor);
      // console.log(101, unlockAmount, firstUnlockAmount, claimed);
      // console.log(102, claimable);

      if (claimable > amount - claimed) {
        return amount - claimed;
      }

      return claimable;
    }

    return 0;
  }

  function isFinished(address account) external view returns (bool) {
    return (allocations[account].claimed == allocations[account].amount);
  }

  function nextClaimingAt(address wallet) public view returns (uint256) {
    if (canClaim(wallet)) return 0;
    if (allocations[wallet].claimed == 0) {
      return startDate;
    } else {
      if (block.timestamp - startDate < cliffPeriod) return startDate + cliffPeriod + unlockPeriod;
      uint256 periodsPassed = (block.timestamp - startDate - cliffPeriod) / unlockPeriod;
      return startDate + cliffPeriod + unlockPeriod * (periodsPassed + 1);
    }
  }

  function calculateRemainAmount(address wallet) public view returns (uint256) {
    return allocations[wallet].amount - allocations[wallet].claimed;
  }

  function fetchClaimingInfo(
    address wallet
  )
    external
    view
    returns (
      uint256 allocation,
      uint256 claimed,
      uint256 remains,
      uint256 available,
      bool _canClaim,
      uint256 _nextClaimingAt
    )
  {
    return (
      allocations[wallet].amount,
      allocations[wallet].claimed,
      calculateRemainAmount(wallet),
      calculateClaimAmount(wallet),
      canClaim(wallet),
      nextClaimingAt(wallet)
    );
  }

  //Write methods-------------------------------------------

  function setAllocation(address to, uint256 amount) external onlyOwner {
    allocations[to].amount = amount;
    allocations[to].claimed = 0;
    //ToDo: add event
  }

  function batchSetAllocations(
    address[] calldata recepients,
    uint256[] calldata amounts
  ) external onlyOwner {
    //ToDo: add check length of arrays
    for (uint32 i = 0; i < recepients.length; i++) {
      allocations[recepients[i]].amount = amounts[i];
      allocations[recepients[i]].claimed = 0;
    }
    //ToDo: add event
  }

  function claim() external nonReentrant {
    address sender = _msgSender();
    uint256 claimable = calculateClaimAmount(sender);

    if (claimable == 0) {
      revert NothingToClaim();
    }

    allocations[sender].claimed += claimable;
    allocations[sender].claimedAt = block.timestamp;

    erc20Token.safeTransfer(sender, claimable);

    emit Claim(sender, claimable);
  }
}
