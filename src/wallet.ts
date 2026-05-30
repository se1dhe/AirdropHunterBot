import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

export const getEthAddress = (): string => {
  const address = process.env.ETH_ADDRESS;
  if (!address || !ethers.isAddress(address)) {
    throw new Error('Invalid or missing ETH_ADDRESS in .env');
  }
  return address;
};
