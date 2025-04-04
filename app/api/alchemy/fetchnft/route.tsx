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
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }
  ],
  "name": "ownerOf",
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('tokenId');

    if (!tokenId) {
        return NextResponse.json({ error: 'Missing required tokenId parameter' }, { status: 400 });
    }

    try {
        const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
        const ethTokenId = ethers.toBigInt(tokenId);
        
        const collection = await getCollection('nftMetadata');
        
        const metadata = await collection.findOne({ name: new RegExp(`#${tokenId}$`, 'i') });
        
        if (!metadata) {
            console.error(`Metadata not found for tokenId: ${tokenId}`);
            return NextResponse.json({ 
                error: 'NFT not found',
                message: `No metadata found for tokenId: ${tokenId}`
            }, { status: 404 });
        }
        
        const baseContract = new ethers.Contract(NFTBaseContractAddress, mainNFTContractABI, provider);
        const stakingContract = new ethers.Contract(NFTStakingContractAddress, stakingContractABI, provider);
        
        let isStaked = false;
        let stakedAt = null;
        let ownerAddress = null;
        
        try {
            try {
                ownerAddress = await baseContract.ownerOf(ethTokenId);
                isStaked = false;
            } catch {
                console.log(`NFT #${tokenId} not found in base contract, checking staking contract...`);
                
                const stakedNfts = await stakingContract.walletOfOwner(NFTStakingContractAddress);
                
                const stakedNft = stakedNfts.find((nft: [string, bigint, bigint]) => {
                    const [, , id] = nft;
                    return id.toString() === tokenId;
                });
                
                if (stakedNft) {
                    const [owner, stakedTimestamp] = stakedNft;
                    isStaked = true;
                    ownerAddress = owner;
                    stakedAt = Number(stakedTimestamp);
                    console.log(`NFT #${tokenId} found in staking contract`);
                } else {
                    console.error(`NFT #${tokenId} not found in either contract`);
                }
            }
        } catch (error) {
            console.warn(`Error checking contract status for NFT #${tokenId}:`, error);
        }
        
        const nftData = {
            tokenId,
            ...metadata,
            ...(isStaked !== null ? { staked: isStaked } : {}),
            ...(stakedAt !== null ? { stakedAt } : {}),
            ...(ownerAddress !== null ? { owner: ownerAddress } : {})
        };
        
        return NextResponse.json({ nft: nftData });
    } catch (error) {
        console.error(`Error fetching NFT with tokenId: ${tokenId}:`, error);
        return NextResponse.json({ 
            error: 'Internal Server Error',
            message: 'An error occurred while fetching the NFT data'
        }, { status: 500 });
    }
}