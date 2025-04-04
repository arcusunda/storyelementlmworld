import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '../../../../utils/mongodb';

export async function POST(request: NextRequest) {
  const { id } = await request.json();

  console.info(`Checking votes for story element: ${id}`);

  if (!id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const collection = await getCollection('votes');

    const likeCount = await collection.countDocuments({
      id,
      vote: 'Like',
    });

    const unlikeCount = await collection.countDocuments({
      id,
      vote: 'Unlike',
    });

    console.info(`Votes for ${id}: Likes = ${likeCount}, Unlikes = ${unlikeCount}`);

    return NextResponse.json({ likes: likeCount, unlikes: unlikeCount });
  } catch (error) {
    console.error('Error checking votes:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
