import { Overrides } from 'ethers';
import { ethers } from 'hardhat';

export async function getTxOverrides(gasPriceFactor = 1, gasLimit?: number): Promise<Overrides> {
  const prov = ethers.provider;

  const feeData = await prov.getFeeData();
  const strGasPrice = ((Number(feeData.gasPrice) ?? 1) * gasPriceFactor).toFixed();
  console.log(222, strGasPrice);
  const gasPrice = Number(strGasPrice);

  return {
    gasPrice,
    gasLimit,
  };
}
