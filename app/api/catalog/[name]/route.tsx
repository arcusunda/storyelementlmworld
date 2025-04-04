import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '../../../../utils/mongodb';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const aspect = pathname.split('/').pop()?.replaceAll('%20', ' ');

  if (!aspect || typeof aspect !== 'string') {
    return NextResponse.json({ error: 'Invalid aspect format' }, { status: 400 });
  }

  const validAspects = ['Muerto Body', 'Muerto Mask', 'Muerto Headwear', 'Muerto Expression'];
  if (!validAspects.includes(aspect)) {
    return NextResponse.json({ error: 'Invalid aspect value' }, { status: 400 });
  }

  try {
    const traitsCollection = process.env.TRAITS_COLLECTION === undefined ? 'traits' : process.env.TRAITS_COLLECTION;
    const collection = await getCollection(traitsCollection);

    const count = await collection.countDocuments({ 'attributes.trait_type': 'Aspect', 'attributes.value': aspect });
    console.info(`Counted ${count} traits with aspect ${aspect}`);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 200 });
  }
}
