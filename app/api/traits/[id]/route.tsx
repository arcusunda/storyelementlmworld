import { getCollection } from '../../../../utils/mongodb';
import { NextRequest, NextResponse } from 'next/server';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const id = pathname.split('/').pop()?.replaceAll('%20', ' ');

  if (!id || typeof id !== 'string') {
    console.error('Invalid ID format');
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  const idNumber = Number(id);


  try {
    const traitsCollection = process.env.TRAITS_COLLECTION === undefined ? 'traits' : process.env.TRAITS_COLLECTION;
    const collection = await getCollection(traitsCollection);
    const trait = await collection.findOne({ id: idNumber });

    if (!trait) {
      return NextResponse.json({ error: 'Trait not found' }, { status: 200 });
    }

    return NextResponse.json(trait);
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 200 });
  }
}
