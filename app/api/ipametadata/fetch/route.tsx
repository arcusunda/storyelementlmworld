// /api/ipametadata/fetch/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wallet = searchParams.get('wallet');
    
    if (!wallet) {
      return NextResponse.json({ 
        error: 'Wallet address is required' 
      }, { status: 400 });
    }
    
    const collection = await getCollection('ipaMetadata');
    const query = { walletAddress: wallet };
    
    const ipametadata = await collection
      .find(query)
      .sort({ transformedAt: -1 })
      .limit(100)
      .toArray();
    
    return NextResponse.json({ 
      ipametadata 
    });
  } catch (error) {
    console.error('Error fetching IPA metadata:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch IPA metadata.' 
    }, { status: 500 });
  }
}