import { getCollection } from '../../../../utils/mongodb';
import { NextRequest, NextResponse } from 'next/server';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);

  const tokenId = pathname.split('/').pop()?.replaceAll('%20', ' ');

  if (!tokenId || typeof tokenId !== 'string') {
    console.error('Invalid tokenId format');
    return NextResponse.json({ error: 'Invalid tokenId format' }, { status: 400 });
  }

  try {
    const collection = await getCollection('nftMetadata');
    const metadata = await collection.findOne({ name: new RegExp(`#${tokenId}$`, 'i') });
    console.log('NFT Metadata:', metadata);

    if (!metadata) {
      return NextResponse.json({ error: 'NFT Metadata not found' }, { status: 200 });
    }

    console.log('NFT Metadata:', metadata);
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 200 });
  }
}
