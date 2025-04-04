import { getCollection } from '../../../../utils/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  
  const characterName = pathname.split('/').pop()?.replaceAll('%20', ' ');
  
  if (!characterName || typeof characterName !== 'string') {
    console.error('Invalid character name format');
    return NextResponse.json(
      { error: 'Invalid character name format' }, 
      { status: 400 }
    );
  }
  
  try {
    const collection = await getCollection('characters');
    const character = await collection.findOne({ name: characterName });
    
    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(character);
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}