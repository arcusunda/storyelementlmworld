import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { SeLmVersion } from '@/utils/utils';

interface SaveBackstoryRequest {
  tokenId: string;
  backstory: string;
  name: string;
  nftTitle?: string;
  walletAddress?: string;
  characterName?: {
    firstName: string;
    lastName: string;
  };
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveBackstoryRequest = await request.json();
    const { tokenId, backstory, name, nftTitle, attributes, walletAddress, characterName } = body;
    
    if (!tokenId || !backstory) {
      return NextResponse.json({ 
        error: 'TokenId and backstory are required'
      }, { status: 400 });
    }
    
    const collection = await getCollection('backstories');
    
    const existingBackstory = await collection.findOne({ tokenId });

    console.info(`Saving backstory for SeLmVersion: ${SeLmVersion}`);
    
    if (existingBackstory) {
      await collection.updateOne(
        { tokenId },
        { 
          $set: {
            backstory,
            updatedAt: new Date(),
            seLmVersion: SeLmVersion
          }
        }
      );
    } else {
      await collection.insertOne({
        tokenId,
        backstory,
        walletAddress: walletAddress || 'unknown',
        nftContext: {
          name,
          attributes,
          elementDetails: [] // We don't have element details here, but keeping structure consistent
        },
        characterName,
        nftTitle,
        createdAt: new Date(),
        updatedAt: new Date(),
        isUserEdited: true,
        seLmVersion: SeLmVersion
      });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Backstory saved successfully'
    });
  } catch (error) {
    console.error('Error saving backstory:', error);
    return NextResponse.json({ 
      error: 'Failed to save backstory'
    }, { status: 500 });
  }
}