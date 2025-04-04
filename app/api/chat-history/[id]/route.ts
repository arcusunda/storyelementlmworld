import { getCollection } from '@/utils/mongodb';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest
) {
  try {
    const collection = await getCollection('chatHistory');
    
    const { searchParams } = new URL(request.url);
    const tokenId = parseInt(searchParams.get('id') as string);
    
    const history = await collection
      .find({ tokenId })
      .sort({ createdAt: -1 })
      .toArray();
    
    return Response.json(history);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return Response.json(
      { error: 'Failed to fetch chat history' }, 
      { status: 500 }
    );
  }
}