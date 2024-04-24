//SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SQRVesting is Ownable {
  //Variables, structs, modifiers, events------------------------

  string public constant VERSION = "1.0";

  IERC20 public erc20Token;
  uint256 public startDate;
  uint256 public cliffPeriod;
  uint256 public firstUnlockPercent;
  uint256 public unlockPeriod;
  uint256 public unlockPeriodPercent;
  uint256 public afterPurchaseCliffPeriod;

  struct Allocation {
    uint256 amount;
    uint256 claimed;
    uint256 claimedAt;
  }
  mapping(address => Allocation) public allocations;

  uint256 public constant PERCENT_DIVIDER = 1e18 * 100;

  event Claim(address indexed account, uint256 amount);

  constructor(
    address _newOwner,
    address _erc20Token,
    uint256 _startDate,
    uint256 _cliffPeriod,
    uint256 _firstUnlockPercent,
    uint256 _unlockPeriod,
    uint256 _unlockPeriodPercent,
    uint256 _afterPurchaseCliffPeriod
  ) Ownable(_newOwner) {
    //ToDo: add checks
    erc20Token = IERC20(_erc20Token);
    startDate = _startDate;
    cliffPeriod = _cliffPeriod;
    firstUnlockPercent = _firstUnlockPercent;
    unlockPeriod = _unlockPeriod;
    unlockPeriodPercent = _unlockPeriodPercent;
    afterPurchaseCliffPeriod = _afterPurchaseCliffPeriod;
  }

  //Read methods-------------------------------------------
  function getBalance() public view returns (uint256) {
    return erc20Token.balanceOf(address(this));
  }

  function canClaim(address account) public view returns (bool) {
    return (getClaimableTokens(account) > 0);
  }

  function getClaimableTokens(address account) public view returns (uint256) {
    if (block.timestamp < (startDate + afterPurchaseCliffPeriod)) return 0;

    uint256 tokensToClaimAfterPurchase = (allocations[account].amount * firstUnlockPercent) /
      PERCENT_DIVIDER;
    uint256 tokenstToClaimPerPeriod = (allocations[account].amount * unlockPeriodPercent) /
      PERCENT_DIVIDER;
    uint256 claimed = allocations[account].claimed;
    uint256 amount = allocations[account].amount;
    if (block.timestamp >= startDate + cliffPeriod || claimed + tokenstToClaimPerPeriod > amount)
      return amount - claimed;

    if (claimed == 0) {
      uint256 claimable = tokensToClaimAfterPurchase;
      return claimable;
    } else {
      if (block.timestamp < startDate + afterPurchaseCliffPeriod + cliffPeriod) return 0;
      uint256 claimable = (
        ((block.timestamp - startDate - afterPurchaseCliffPeriod - cliffPeriod) / unlockPeriod)
      ) *
        tokenstToClaimPerPeriod +
        tokensToClaimAfterPurchase -
        claimed;
      if (claimable > amount - claimed) return amount - claimed;

      return claimable;
    }
  }

  function finishedClaiming(address account) external view returns (bool) {
    return (allocations[account].claimed == allocations[account].amount);
  }

  function nextClaimingAt(address wallet) public view returns (uint256) {
    if (canClaim(wallet)) return 0;
    if (allocations[wallet].claimed == 0) {
      return startDate + afterPurchaseCliffPeriod;
    } else {
      if (block.timestamp - startDate < afterPurchaseCliffPeriod)
        return startDate + afterPurchaseCliffPeriod;
      if (block.timestamp - startDate - afterPurchaseCliffPeriod < cliffPeriod)
        return startDate + afterPurchaseCliffPeriod + cliffPeriod + unlockPeriod;
      uint256 periodsPassed = (block.timestamp -
        startDate -
        cliffPeriod -
        afterPurchaseCliffPeriod) / unlockPeriod;
      return
        startDate + afterPurchaseCliffPeriod + cliffPeriod + unlockPeriod * (periodsPassed + 1);
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

  function claim() public {
    uint256 claimable = getClaimableTokens(msg.sender);
    require(claimable > 0, "Nothing to claim");

    allocations[msg.sender].claimed += claimable;
    allocations[msg.sender].claimedAt = block.timestamp;
    erc20Token.transfer(msg.sender, claimable);

    emit Claim(msg.sender, claimable);
  }
}
