// /api/storyprotocol/updateRecord/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ipaId, storyProtocolIpId, storyProtocolTxHash, storyProtocolRegisteredAt, licenseTermsIds } = body;
    
    if (!ipaId || !storyProtocolIpId || !storyProtocolTxHash || !storyProtocolRegisteredAt || !licenseTermsIds) {
      return NextResponse.json({ 
        error: 'Missing required parameters: ipaId, storyProtocolIpId, storyProtocolRegisteredAt, storyProtocolTxHash, licenseTermsIds' 
      }, { status: 400 });
    }
    
    const collection = await getCollection('ipaMetadata');
    
    const result = await collection.updateOne(
      { _id: new ObjectId(ipaId) },
      { 
        $set: {
          storyProtocolIpId: storyProtocolIpId,
          storyProtocolTxHash: storyProtocolTxHash,
          licenseTermsIds: licenseTermsIds,
          storyProtocolRegisteredAt: new Date(),
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ 
        error: 'Failed to update record or record not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'IP Asset registration details successfully updated'
    });
    
  } catch (error) {
    console.error('Error updating IP Asset registration details:', error);
    return NextResponse.json({ 
      error: 'Failed to update IP Asset registration details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}