// app/api/licenses/recordMinting/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ipaId, licensorIpId, licenseTermsId, licenseTokenIds, wallet, txHash } = body;
    
    if (!ipaId || !licensorIpId || !licenseTermsId || !licenseTokenIds || !wallet || !txHash) {
      return NextResponse.json({ 
        error: 'Missing required parameters' 
      }, { status: 400 });
    }
    
    const ipaCollection = await getCollection('ipaMetadata');
    const ipaMetadata = await ipaCollection.findOne({ 
      _id: new ObjectId(ipaId),
      storyProtocolIpId: licensorIpId,
      licenseTermsIds: licenseTermsId
    });
    
    if (!ipaMetadata) {
      return NextResponse.json({ 
        error: 'IP asset not found or does not match provided license information' 
      }, { status: 404 });
    }
    
    const licenseCollection = await getCollection('licenseTokens');
    const now = new Date();
    
    const licenseDocuments = licenseTokenIds.map((tokenId: unknown) => ({
      tokenId,
      licenseTermsId,
      licensorIpId,
      ipaId,
      wallet: wallet.toLowerCase(),
      txHash,
      mintedAt: now
    }));
    
    const result = await licenseCollection.insertMany(licenseDocuments);
    
    if (!result.acknowledged) {
      throw new Error('Failed to insert license token records');
    }
    
    return NextResponse.json({
      success: true,
      message: 'License token minting recorded successfully',
      count: licenseTokenIds.length
    });
    
  } catch (error) {
    console.error('Error recording license token minting:', error);
    return NextResponse.json({ 
      error: 'Failed to record license token minting',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}