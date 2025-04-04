// app/api/licenses/fetchRegistered/route.tsx
import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET() {
  try {
    const collection = await getCollection('ipaMetadata');
    
    const query = { 
      storyProtocolIpId: { $exists: true, $ne: null },
      licenseTermsIds: { $exists: true, $ne: null }
    };
    
    const ipametadata = await collection
      .find(query)
      .sort({ storyProtocolRegisteredAt: -1 })
      .limit(100)
      .toArray();
    
    return NextResponse.json({ 
      ipametadata 
    });
  } catch (error) {
    console.error('Error fetching registered IPA metadata:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch registered IPA metadata.' 
    }, { status: 500 });
  }
}