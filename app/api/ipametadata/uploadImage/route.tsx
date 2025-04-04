// /api/ipametadata/uploadImage/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';
import { createHash } from 'crypto';
import { uploadFileToIPFS } from '@/utils/uploadToIpfs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const ipaId = formData.get('ipaId') as string;
    const wallet = formData.get('wallet') as string;
    
    if (!file || !ipaId || !wallet) {
      return NextResponse.json({ 
        error: 'Missing required parameters: file, ipaId, and wallet' 
      }, { status: 400 });
    }
    
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'The file must be an image' 
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
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const fileExtension = file.name.split('.').pop() || 'png';
    const tempFilename = `${randomUUID()}.${fileExtension}`;
    const tempFilePath = join(tmpdir(), tempFilename);
    
    await writeFile(tempFilePath, buffer);
    
    const ipfsHash = await uploadFileToIPFS(tempFilePath, file.name, file.type);
    const imageUrl = `ipfs://${ipfsHash}`;
    
    const imageHash = createHash('sha256').update(buffer).digest('hex');
    
    await collection.updateOne(
      { _id: new ObjectId(ipaId) },
      { 
        $set: { 
          image: imageUrl,
          imageHash: imageHash,
          mediaUrl: imageUrl,
          mediaHash: imageHash,
          mediaType: file.type
        } 
      }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Image uploaded and metadata updated successfully',
      imageUrl: imageUrl,
      imageHash: imageHash
    });
    
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}