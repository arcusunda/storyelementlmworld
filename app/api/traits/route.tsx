import { getCollection } from '../../../utils/mongodb';
import { NextRequest, NextResponse } from 'next/server';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const addressParam = url.searchParams.get('address');
    const aspectParam = url.searchParams.get('aspect');
    const muertoAttributeParam = url.searchParams.get('muertoAttributeParam');
    const attributeNameParam = url.searchParams.get('attributeName');
    const muertoAttributeParamSplit = muertoAttributeParam
      ? muertoAttributeParam.split('/').pop()?.replaceAll('%20', ' ')
      : null;

    const traitsCollection = process.env.TRAITS_COLLECTION === undefined ? 'traits' : process.env.TRAITS_COLLECTION;

    const collection = await getCollection(traitsCollection);

    const query: Record<string, unknown> = {};

    if (addressParam) {
      query.address = addressParam;
    }

    if (aspectParam) {
      query.attributes = {
        $elemMatch: {
          trait_type: 'Aspect',
          value: aspectParam,
        },
      };
    }

    if (attributeNameParam) {
      query.attributeName = attributeNameParam;
    }

    if (muertoAttributeParamSplit) {
      const trait = await collection.findOne({ name: muertoAttributeParamSplit });
      
      if (!trait) {
        return NextResponse.json({ error: 'Trait not found' }, { status: 200 });
      }
      return NextResponse.json(trait);
    }

    if (attributeNameParam) {
      const trait = await collection.findOne({ name: attributeNameParam });
      
      if (!trait) {
        return NextResponse.json({ error: 'Trait not found' }, { status: 200 });
      }
      return NextResponse.json(trait);
    }

    const traits = await collection.find(query).toArray();
    return NextResponse.json(traits);
  } catch (error) {
    console.error('Error fetching traits:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
