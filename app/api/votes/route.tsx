import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '../../../utils/mongodb';

export async function POST(request: NextRequest) {
  const { id, name, vote, comment } = await request.json();

  console.info(`Received vote: ${vote} for ${name} with comment: "${comment}"`);

  if (!id || !name || !vote) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const collection = await getCollection('votes');

    await collection.insertOne({
      id,
      name,
      vote,
      comment: comment || '',
      timestamp: new Date(),
    });

    const likeCount = await collection.countDocuments({
      id,
      vote: 'Like',
    });

    const unlikeCount = await collection.countDocuments({
      id,
      vote: 'Unlike',
    });

    return NextResponse.json({ likes: likeCount, unlikes: unlikeCount });
  } catch (error) {
    console.error('Error handling vote submission:', error);
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 });
  }
}
