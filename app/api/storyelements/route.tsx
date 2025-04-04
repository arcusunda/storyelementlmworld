import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wallet = searchParams.get('wallet');
    const tokenId = searchParams.get('tokenId');
    const storyElementId = searchParams.get('storyElementId');
    const shortId = searchParams.get('shortId');
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    
    const collection = await getCollection('rawStoryElements');
    let query = {};
    
    if (wallet) {
      query = { ...query, walletAddress: wallet };
    }
    
    if (tokenId) {
      query = { ...query, tokenId };
    }
    
    if (storyElementId) {
      try {
        query = { ...query, _id: new ObjectId(storyElementId) };
      } catch (error) {
        console.error('Invalid storyElementId format:', error);
        return NextResponse.json({ 
          error: 'Invalid storyElementId format' 
        }, { status: 400 });
      }
    }
    
    if (shortId) {
      query = { ...query, shortId };
    }
    
    if (storyElementId && shortId) {
      query = { shortId };
    }
    
    if (activeOnly) {
      query = { ...query, isActive: { $ne: false } };
    }
    
    const rawStoryElements = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
      
    const formattedRawStoryElements = rawStoryElements.map(rawStoryElement => ({
      id: rawStoryElement._id.toString(),
      tokenId: rawStoryElement.tokenId,
      shortId: rawStoryElement.shortId,
      characterName: rawStoryElement.characterName || {
        firstName: "Unknown",
        lastName: "Unknown"
      },
      nftTitle: rawStoryElement.nftTitle || `Los Muertos #${rawStoryElement.tokenId}`,
      storyElement: rawStoryElement.storyElement,
      createdAt: rawStoryElement.createdAt,
      creatorAddress: rawStoryElement.walletAddress,
      isActive: rawStoryElement.isActive !== false,
      animationNotes: rawStoryElement.animationNotes || null
    }));
    
    return NextResponse.json({ 
      rawStoryElements: formattedRawStoryElements 
    });
  } catch (error) {
    console.error('Error fetching rawStoryElements:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch rawStoryElements.' 
    }, { status: 500 });
  }
}