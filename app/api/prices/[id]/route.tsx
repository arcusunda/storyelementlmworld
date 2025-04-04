import { getCollection } from '@/utils/mongodb';
import { NextRequest } from 'next/server';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  const { id } = await params;

  try {
    const collection = await getCollection('prices');

    if (!id) {
      return Response.json(
        { error: 'Token ID is required' },
        { status: 400 }
      );
    }

    const prices = await collection
      .find({ tokenId: id })
      .sort({ timestamp: -1 })
      .toArray();

    console.log(`Found ${prices.length} prices for token ${id}`);

    return Response.json(prices);
  } catch (error) {
    console.error('Error fetching price history:', error);
    return Response.json(
      { error: 'Failed to fetch price history' },
      { status: 500 }
    );
  }
}