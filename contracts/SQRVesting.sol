//SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SQRVesting is Ownable {
  //Variables, structs, modifiers, events------------------------

  string public constant VERSION = "1.0";

  IERC20 public erc20Token;
  uint256 public startDate;
  uint256 public cliffDate;
  uint256 public firstUnlockPercent;
  uint256 public unlockPeriod;
  uint256 public unlockPeriodPercent;
  uint256 public afterPurchaseCliffDate;

  struct Allocation {
    uint256 amount;
    bool bought;
    uint256 claimed;
    uint256 rate;
    uint256 claimedAt;
  }
  mapping(address => Allocation) public allocations;

  uint256 public constant ONE_HUNDRED_PERCENT = 1e18 * 100;

  event Claim(address indexed user, uint256 amount);

  constructor(
    address _newOwner,
    address _erc20Token,
    uint256 _startDate,
    uint256 _cliffDate,
    uint256 _firstUnlockPercent,
    uint256 _unlockPeriodPercent,
    uint256 _unlockPeriod,
    uint256 _afterPurchaseCliffDate
  ) Ownable(_newOwner) {
    erc20Token = IERC20(_erc20Token);
    startDate = _startDate;
    cliffDate = _cliffDate;
    firstUnlockPercent = _firstUnlockPercent;
    unlockPeriod = _unlockPeriod;
    unlockPeriodPercent = _unlockPeriodPercent;
    afterPurchaseCliffDate = _afterPurchaseCliffDate;
  }

  //Read methods-------------------------------------------

  function canClaim(address user) public view returns (bool) {
    return (getClaimableTokens(user) > 0);
  }

  function getClaimableTokens(address user) public view returns (uint256) {
    if (block.timestamp < (startDate + afterPurchaseCliffDate)) return 0;

    uint256 tokensToClaimAfterPurchase = (allocations[user].amount * firstUnlockPercent) /
      ONE_HUNDRED_PERCENT;
    uint256 tokenstToClaimPerPeriod = (allocations[user].amount * unlockPeriodPercent) /
      ONE_HUNDRED_PERCENT;
    uint256 claimed = allocations[user].claimed;
    uint256 amount = allocations[user].amount;
    if (block.timestamp >= startDate + cliffDate || claimed + tokenstToClaimPerPeriod > amount)
      return amount - claimed;

    if (claimed == 0) {
      uint256 claimable = tokensToClaimAfterPurchase;
      return claimable;
    } else {
      if (block.timestamp < startDate + afterPurchaseCliffDate + cliffDate) return 0;
      uint256 claimable = (
        ((block.timestamp - startDate - afterPurchaseCliffDate - cliffDate) / unlockPeriod)
      ) *
        tokenstToClaimPerPeriod +
        tokensToClaimAfterPurchase -
        claimed;
      if (claimable > amount - claimed) return amount - claimed;

      return claimable;
    }
  }

  function finishedClaiming(address user) external view returns (bool) {
    return (allocations[user].claimed == allocations[user].amount);
  }

  function nextClaimingAt(address wallet) public view returns (uint256) {
    if (canClaim(wallet)) return 0;
    if (allocations[wallet].claimed == 0) {
      return startDate + afterPurchaseCliffDate;
    } else {
      if (block.timestamp - startDate < afterPurchaseCliffDate)
        return startDate + afterPurchaseCliffDate;
      if (block.timestamp - startDate - afterPurchaseCliffDate < cliffDate)
        return startDate + afterPurchaseCliffDate + cliffDate + unlockPeriod;
      uint256 periodsPassed = (block.timestamp - startDate - cliffDate - afterPurchaseCliffDate) /
        unlockPeriod;
      return startDate + afterPurchaseCliffDate + cliffDate + unlockPeriod * (periodsPassed + 1);
    }
  }

  function remained(address wallet) public view returns (uint256) {
    return allocations[wallet].amount - allocations[wallet].claimed;
  }

  function claimingInfo(
    address wallet
  )
    external
    view
    returns (
      uint256 allocation,
      uint256 claimed,
      uint256 remainedToClaim,
      uint256 available,
      bool _canClaim,
      uint256 _nextClaimingAt
    )
  {
    return (
      allocations[wallet].amount,
      allocations[wallet].claimed,
      remained(wallet),
      getClaimableTokens(wallet),
      canClaim(wallet),
      nextClaimingAt(wallet)
    );
  }

  //Write methods-------------------------------------------

  function setAllocation(address _to, uint256 _amount, uint256 _rate) external onlyOwner {
    allocations[_to].amount = _amount;
    allocations[_to].claimed = 0;
    allocations[_to].rate = _rate;
    allocations[_to].bought = false;
  }

  function batchSetAllocations(
    address[] calldata _recepients,
    uint256[] calldata _amounts,
    uint256 _rate
  ) external onlyOwner {
    for (uint32 i = 0; i < _recepients.length; i++) {
      allocations[_recepients[i]].amount = _amounts[i];
      allocations[_recepients[i]].claimed = 0;
      allocations[_recepients[i]].rate = _rate;
      allocations[_recepients[i]].bought = false;
    }
  }

  function claim() public {
    uint256 claimable = getClaimableTokens(msg.sender);
    require(claimable > 0, "Nothing to claim");

    allocations[msg.sender].claimed += claimable;
    allocations[msg.sender].claimedAt = block.timestamp;
    erc20Token.transfer(msg.sender, claimable);

    emit Claim(msg.sender, claimable);
  }
}
