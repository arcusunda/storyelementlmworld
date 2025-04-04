import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { SeLmVersion } from '@/utils/utils';

interface SaveStoryElementRequest {
  tokenId: string;
  storyElement: string;
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
    const body: SaveStoryElementRequest = await request.json();
    const { tokenId, storyElement, name, nftTitle, attributes, walletAddress, characterName } = body;
    
    if (!tokenId || !storyElement) {
      return NextResponse.json({ 
        error: 'TokenId and storyElement are required'
      }, { status: 400 });
    }
    
    const collection = await getCollection('rawStoryElements');
    
    const existingStoryElement = await collection.findOne({ tokenId });

    console.info(`Saving storyElement for SeLmVersion: ${SeLmVersion}`);
    
    if (existingStoryElement) {
      await collection.updateOne(
        { tokenId },
        { 
          $set: {
            storyElement,
            updatedAt: new Date(),
            seLmVersion: SeLmVersion
          }
        }
      );
    } else {
      await collection.insertOne({
        tokenId,
        storyElement,
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
      message: 'StoryElement saved successfully'
    });
  } catch (error) {
    console.error('Error saving storyElement:', error);
    return NextResponse.json({ 
      error: 'Failed to save storyElement'
    }, { status: 500 });
  }
}