// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

/**
 * @dev Interface for contract that has accounts.
 */
interface IAccountInfo {
  /**
   * @dev Returns the value of account count.
   */
  function getAccountCount() external view returns (uint32);

  /**
   * @dev Returns the account by index.
   */
  function getAccountByIndex(uint32 index) external view returns (address);
}
