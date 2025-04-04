import { Address } from 'viem/accounts'

export const AlchemyApiKey = process.env.ALCHEMY_API_KEY || '';

export const AlchemyBaseNftUrl = process.env.ALCHEMY_BASE_NFT_URL || 'Unnamed'

export const NFTBaseContractAddress = process.env.NFT_BASE_CONTRACT_ADDRESS || '0x8fba3ebe97dc5a2eb41d9cfe5b9b6c3cd89be779';

export const NFTContractAddress: Address = (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as Address) || 'Unnamed'

export const NFTStakingContractAddress = process.env.NFT_STAKING_CONTRACT_ADDRESS || '0x37c37718a1835ff7ed0b61812808595cbc68a561';

export const BaseNFTMetadata = process.env.BASE_NFT_METADATA || 'QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq';

export const SeLmVersion = process.env.SE_LM_VERSION || '0.0.1';

export const StoryScanBaseUrl = process.env.NEXT_PUBLIC_STORY_SCAN_BASE_URL || 'aeneid.storyscan.xyz';