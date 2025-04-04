// /api/ipametadata/fetchOne/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        error: 'ID parameter is required' 
      }, { status: 400 });
    }
    
    const collection = await getCollection('ipaMetadata');
    
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch  {
      return NextResponse.json({ 
        error: 'Invalid ID format' 
      }, { status: 400 });
    }
    
    const ipametadata = await collection.findOne({ _id: objectId });
    
    if (!ipametadata) {
      return NextResponse.json({ 
        error: 'IP asset not found' 
      }, { status: 404 });
    }
    
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