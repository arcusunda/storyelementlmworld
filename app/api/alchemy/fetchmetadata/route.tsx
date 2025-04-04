import { NextRequest, NextResponse } from 'next/server';
import { NFTBaseContractAddress, NFTStakingContractAddress } from '../../../../utils/utils';
import { ethers } from 'ethers';
import { getCollection } from '../../../../utils/mongodb';

export const maxDuration = 60;

const stakingContractABI = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "owner_",
        "type": "address"
      }
    ],
    "name": "walletOfOwner",
    "outputs": [
      {
        "components": [
          {
            "name": "owner",
            "type": "address"
          },
          {
            "name": "stakedAt",
            "type": "uint256"
          },
          {
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "",
        "type": "tuple[]"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

const mainNFTContractABI = [{
  "inputs": [
    {
      "internalType": "address",
      "name": "_owner",
      "type": "address"
    }
  ],
  "name": "walletOfOwner",
  "outputs": [
    {
      "internalType": "uint256[]",
      "name": "",
      "type": "uint256[]"
    }
  ],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}
];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    try {
        const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

        const stakingContract = new ethers.Contract(NFTStakingContractAddress, stakingContractABI, provider);
        console.info(`Fetching staked NFTs from contract: ${NFTStakingContractAddress}`);
        const stakedNfts = await stakingContract.walletOfOwner(wallet);

        const contract = new ethers.Contract(NFTBaseContractAddress, mainNFTContractABI, provider);
        console.info(`Fetching unstaked NFTs from contract: ${NFTBaseContractAddress}`);
        const nfts = await contract.walletOfOwner(wallet);

        const collection = await getCollection('nftMetadata');

        const stakedNftMetadata = await Promise.all(stakedNfts.map(async (stakedNft: [string, bigint, bigint] | bigint) => {
          const [, stakedAt, tokenId] = stakedNft as [string, bigint, bigint];
          if (tokenId === undefined || tokenId === null) {
            console.error('Token ID is undefined or null for:', stakedNft);
            return { error: 'Token ID is undefined or null', stakedNft };
          }
          const tokenIdString = tokenId.toString();

          try {
            const metadata = await collection.findOne({ name: new RegExp(`#${tokenIdString}$`, 'i') });
            
            if (!metadata) {
              console.error('Metadata not found for staked tokenId:', tokenIdString);
              return { 
                tokenId: tokenIdString, 
                error: 'Metadata not found',
                staked: true,
                stakedAt: Number(stakedAt)
              };
            }

            return { 
              tokenId: tokenIdString,
              ...metadata,
              staked: true,
              stakedAt: Number(stakedAt)
            };
          } catch (error) {
            console.error('Error fetching metadata for staked tokenId:', tokenIdString, error);
            return { 
              tokenId: tokenIdString, 
              error: 'Error fetching metadata',
              staked: true,
              stakedAt: Number(stakedAt)
            };
          }
        }));

        const unstackedNftMetadata = await Promise.all(nfts.map(async (nft: bigint) => {
          const tokenIdString = nft.toString();

          try {
            const metadata = await collection.findOne({ name: new RegExp(`#${tokenIdString}$`, 'i') });
            
            if (!metadata) {
              console.error('Metadata not found for unstaked tokenId:', tokenIdString);
              return { 
                tokenId: tokenIdString, 
                error: 'Metadata not found',
                staked: false
              };
            }

            return { 
              tokenId: tokenIdString, 
              ...metadata,
              staked: false
            };
          } catch (error) {
            console.error('Error fetching metadata for unstaked tokenId:', tokenIdString, error);
            return { 
              tokenId: tokenIdString, 
              error: 'Error fetching metadata',
              staked: false
            };
          }
        }));

        const combinedMetadata = [...stakedNftMetadata, ...unstackedNftMetadata];

        return NextResponse.json({ nfts: combinedMetadata });
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}