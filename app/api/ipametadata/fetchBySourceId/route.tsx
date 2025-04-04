// /api/ipametadata/fetchBySourceId/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sourceId = searchParams.get('sourceId');
    
    if (!sourceId) {
      return NextResponse.json({
        error: 'sourceId parameter is required'
      }, { status: 400 });
    }
    
    const collection = await getCollection('ipaMetadata');
    
    const ipametadata = await collection.findOne({ sourceId });
    
    if (!ipametadata) {
      return NextResponse.json({
        error: 'IP asset not found for this sourceId'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      ipametadata
    });
  } catch (error) {
    console.error('Error fetching IPA metadata by sourceId:', error);
    return NextResponse.json({
      error: 'Failed to fetch IPA metadata.'
    }, { status: 500 });
  }
}