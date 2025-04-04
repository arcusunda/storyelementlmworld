// app/api/licenses/fetchTokens/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ipId = searchParams.get('ipId');
    const wallet = searchParams.get('wallet');
    
    if (!ipId || !wallet) {
      return NextResponse.json({ 
        error: 'Missing required parameters: ipId and wallet' 
      }, { status: 400 });
    }
    
    const collection = await getCollection('licenseTokens');
    const query = { 
      licensorIpId: ipId,
      wallet: wallet.toLowerCase()
    };
    
    const licenseTokens = await collection
      .find(query)
      .sort({ mintedAt: -1 })
      .toArray();
    
    return NextResponse.json({ 
      licenseTokens 
    });
  } catch (error) {
    console.error('Error fetching license tokens:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch license tokens.' 
    }, { status: 500 });
  }
}