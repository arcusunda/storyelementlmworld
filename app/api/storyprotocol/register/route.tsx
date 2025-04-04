// /api/storyprotocol/register/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';
import { createHash } from 'crypto';
import { uploadJSONToIPFS } from '@/utils/uploadToIpfs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ipaId, wallet, ipMetadata, nftMetadata } = body;
    
    if (!ipaId || !wallet || !ipMetadata || !nftMetadata) {
      return NextResponse.json({ 
        error: 'Missing required parameters: ipaId, wallet, ipMetadata, and nftMetadata' 
      }, { status: 400 });
    }
    
    const collection = await getCollection('ipaMetadata');
    const ipaMetadata = await collection.findOne({ _id: new ObjectId(ipaId) });
    
    if (!ipaMetadata) {
      return NextResponse.json({ 
        error: 'IPA metadata not found' 
      }, { status: 404 });
    }

    if (ipaMetadata.walletAddress.toLowerCase() !== wallet.toLowerCase()) {
      console.info(`You are not the creator of this StoryElement. Wallet: ${wallet} | Creator: ${ipaMetadata.walletAddress}`);
      return NextResponse.json({ 
        error: 'You are not the creator of this StoryElement' 
      }, { status: 403 });
    }
    
    const ipIpfsHash = await uploadJSONToIPFS(ipMetadata);
    const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex');
    const nftIpfsHash = await uploadJSONToIPFS(nftMetadata);
    const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex');
    
    return NextResponse.json({
      success: true,
      message: 'IP Asset metadata prepared for registration',
      registrationData: {
        ipaId: ipaId,
        ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
        ipMetadataHash: `0x${ipHash}`,
        nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
        nftMetadataHash: `0x${nftHash}`,
      }
    });
    
  } catch (error) {
    console.error('Error preparing IP Asset for registration:', error);
    return NextResponse.json({ 
      error: 'Failed to prepare IP Asset for registration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}