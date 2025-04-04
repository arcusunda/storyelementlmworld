// utils/storyProtocolUtils.ts
import { Address } from 'viem/accounts';

export type NetworkType = 'aeneid' | 'mainnet';

export interface NetworkConfig {
  rpcProviderUrl: string;
  protocolExplorer: string;
  defaultNFTContractAddress: Address | null;
  defaultSPGNFTContractAddress: Address | null;
}

export const networkConfigs: Record<NetworkType, NetworkConfig> = {
  aeneid: {
    rpcProviderUrl: 'https://aeneid.storyrpc.io',
    protocolExplorer: 'https://aeneid.storyscan.io',
    defaultNFTContractAddress: '0x937bef10ba6fb941ed84b8d249abc76031429a9a' as Address,
    defaultSPGNFTContractAddress: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc' as Address,
  },
  mainnet: {
    rpcProviderUrl: 'https://mainnet.storyrpc.io',
    protocolExplorer: 'https://explorer.story.foundation',
    defaultNFTContractAddress: null,
    defaultSPGNFTContractAddress: null,
  },
};

export const getNetwork = (): NetworkType => {
  const network = process.env.STORY_NETWORK as NetworkType;
  if (network && !(network in networkConfigs)) {
    throw new Error(`Invalid network: ${network}. Must be one of: ${Object.keys(networkConfigs).join(', ')}`);
  }
  return network || 'aeneid';
};

export const getNetworkConfig = () => {
  const network = getNetwork();
  return {
    ...networkConfigs[network],
    rpcProviderUrl: process.env.RPC_PROVIDER_URL || networkConfigs[network].rpcProviderUrl,
  };
};

export const getIpLink = (ipId: string) => {
  const networkConfig = getNetworkConfig();
  return `${networkConfig.protocolExplorer}/ip/${ipId}`;
};

export const getLicenseTermsLink = (licenseTermsId: string) => {
  const networkConfig = getNetworkConfig();
  return `${networkConfig.protocolExplorer}/license/${licenseTermsId}`;
};

export const getTransactionLink = (txHash: string) => {
  const networkConfig = getNetworkConfig();
  return `${networkConfig.protocolExplorer}/tx/${txHash}`;
};

export const getLicenseTokenLink = (tokenId: string) => {
  const networkConfig = getNetworkConfig();
  return `${networkConfig.protocolExplorer}/licenseToken/${tokenId}`;
};