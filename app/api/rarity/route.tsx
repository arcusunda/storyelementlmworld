import { getCollection } from '@/utils/mongodb';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest
) {
  try {
    const collection = await getCollection('rarityScores');
    
    const { searchParams } = new URL(request.url);
    const tokenId = parseInt(searchParams.get('id') as string);
    
    if (!isNaN(tokenId)) {
      const nftName = `Los Muertos #${tokenId}`;
      const rarityScore = await collection.findOne({ nftName });
      
      if (!rarityScore) {
        return Response.json(
          { error: 'Rarity score not found' },
          { status: 404 }
        );
      }
      
      return Response.json(rarityScore);
    }
    
    const topRarityScores = await collection
      .find({})
      .sort({ totalScore: -1 })
      .limit(100)
      .toArray();

    console.log('Top rarity scores:', topRarityScores);  
      
    return Response.json(topRarityScores);
    
  } catch (error) {
    console.error('Error fetching rarity scores:', error);
    return Response.json(
      { error: 'Failed to fetch rarity scores' },
      { status: 500 }
    );
  }
}