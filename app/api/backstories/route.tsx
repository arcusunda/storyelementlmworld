import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wallet = searchParams.get('wallet');
    const tokenId = searchParams.get('tokenId');
    const backstoryId = searchParams.get('backstoryId');
    const shortId = searchParams.get('shortId');
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    
    const collection = await getCollection('backstories');
    let query = {};
    
    if (wallet) {
      query = { ...query, walletAddress: wallet };
    }
    
    if (tokenId) {
      query = { ...query, tokenId };
    }
    
    if (backstoryId) {
      try {
        query = { ...query, _id: new ObjectId(backstoryId) };
      } catch (error) {
        console.error('Invalid backstoryId format:', error);
        return NextResponse.json({ 
          error: 'Invalid backstoryId format' 
        }, { status: 400 });
      }
    }
    
    if (shortId) {
      query = { ...query, shortId };
    }
    
    if (backstoryId && shortId) {
      query = { shortId };
    }
    
    if (activeOnly) {
      query = { ...query, isActive: { $ne: false } };
    }
    
    const backstories = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
      
    const formattedBackstories = backstories.map(backstory => ({
      id: backstory._id.toString(),
      tokenId: backstory.tokenId,
      shortId: backstory.shortId,
      characterName: backstory.characterName || {
        firstName: "Unknown",
        lastName: "Unknown"
      },
      nftTitle: backstory.nftTitle || `Los Muertos #${backstory.tokenId}`,
      backstory: backstory.backstory,
      createdAt: backstory.createdAt,
      creatorAddress: backstory.walletAddress,
      isActive: backstory.isActive !== false,
      animationNotes: backstory.animationNotes || null
    }));
    
    return NextResponse.json({ 
      backstories: formattedBackstories 
    });
  } catch (error) {
    console.error('Error fetching backstories:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch backstories.' 
    }, { status: 500 });
  }
}