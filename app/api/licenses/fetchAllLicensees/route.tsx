// app/api/licenses/fetchAllLicensees/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ipId = searchParams.get('ipId');
    
    if (!ipId) {
      return NextResponse.json({ 
        error: 'Missing required parameter: ipId' 
      }, { status: 400 });
    }
    
    const collection = await getCollection('licenseTokens');
    const query = { 
      licensorIpId: ipId
    };
    
    const licensees = await collection
      .find(query)
      .project({
        wallet: 1,
        tokenId: 1,
        mintedAt: 1,
        txHash: 1,
        _id: 0
      })
      .sort({ mintedAt: -1 })
      .toArray();
    
    return NextResponse.json({ 
      licensees,
      count: licensees.length
    });
  } catch (error) {
    console.error('Error fetching licensees:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch licensees.' 
    }, { status: 500 });
  }
}