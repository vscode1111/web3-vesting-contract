import appRoot from 'app-root-path';
import { readFileSync, writeFileSync } from 'fs';
import { DeployFunction } from 'hardhat-deploy/types';
import { callWithTimerHre, checkFilePathSync, getParentDirectory } from '~common';
import { SQR_VESTING_NAME } from '~constants';

const func: DeployFunction = async (): Promise<void> => {
  await callWithTimerHre(async () => {
    const root = appRoot.toString();
    const contractName = 'SQRVesting';
    const sourcePath = `${root}/artifacts/contracts/${contractName}.sol/${contractName}.json`;

    const file = readFileSync(sourcePath, { encoding: 'utf8', flag: 'r' });
    const jsonFile = JSON.parse(file);

    const abi = jsonFile.abi;
    const targetPath = `${root}/abi/${contractName}.json`;
    checkFilePathSync(getParentDirectory(targetPath));
    writeFileSync(targetPath, JSON.stringify(abi, null, 2));

    console.log(`ABI-file was saved to ${targetPath}`);
  });
};

func.tags = [`${SQR_VESTING_NAME}:publish-abi`];

export default func;
