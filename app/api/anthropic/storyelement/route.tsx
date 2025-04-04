// api/anthropic/storyelement/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getCollection } from '@/utils/mongodb';
import { SeLmVersion } from '@/utils/utils';
import { getActivePrompt } from '@/utils/promptUtils';

interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

interface ElementDetail {
  type: string;
  name: string;
  description: string;
  category: string;
}

interface StoryElementRequest {
  tokenId: string;
  backstoryId: string;
  name: string;
  nftTitle?: string;
  attributes: NFTAttribute[];
  elementDetails: ElementDetail[];
  walletAddress?: string;
  characterName?: {
    firstName: string;
    lastName: string;
  };
  forceRegenerate?: boolean;
  elementType?: 'random' | 'spiritAnimal' | 'itemOfPower';
}

interface StoryElementDocument {
  tokenId: string;
  shortId: string;
  storyElement: string;
  walletAddress: string;
  nftContext: {
    name: string;
    attributes: NFTAttribute[];
    elementDetails: ElementDetail[];
  };
  characterName?: {
    firstName: string;
    lastName: string;
  };
  nftTitle?: string;
  model: string;
  createdAt: Date;
  isActive: boolean;
  refinementStage: string;
  elementType?: string;
  promptId?: string;
}

export const maxDuration = 60;

const generateShortId = (tokenId: string): string => {
  const randomSuffix = Math.random()
    .toString(36)
    .substring(2, 7);
  
  return `${tokenId}-${randomSuffix}`;
};

const applyTemplate = (template: string, replacements: Record<string, string>) => {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
};

export async function POST(request: NextRequest) {
  try {
    const body: StoryElementRequest = await request.json();
    const { 
      tokenId,
      nftTitle, 
      attributes, 
      elementDetails, 
      walletAddress,
      characterName: characterNameObj,
      elementType = 'random',
    } = body;
    
    if (!tokenId || !elementDetails || elementDetails.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid request data. Missing tokenId or element details.' 
      }, { status: 400 });
    }
    
    const collection = await getCollection('rawStoryElements');
    const backstoryCollection = await getCollection('backstories');
    
    console.info('Generating a storyElement for tokenId:', tokenId, 'of type:', elementType);
    const backstory = await backstoryCollection.findOne({
      tokenId: tokenId
    });
    
    if (!backstory) {
      return NextResponse.json({ 
        error: 'Backstory not found.' 
      }, { status: 404 });
    }
    
    const promptType = `storyElement_${elementType}`;
    console.info(`Fetching prompt of type: ${promptType}`);
    
    const prompt = await getActivePrompt(promptType) as { _id: string, systemContext: string, contentTemplate: string };
    
    if (!prompt) {
      return NextResponse.json({ 
        error: `No active prompt template found for ${elementType} story element generation.` 
      }, { status: 500 });
    }
    
    const characterFullName = `${characterNameObj?.firstName} ${characterNameObj?.lastName}`;
    const replacements = {
      characterName: characterFullName,
      firstName: characterNameObj?.firstName || '',
      lastName: characterNameObj?.lastName || '',
      backstory: backstory.backstory,
      tokenId: tokenId
    };
    
    const systemContext = applyTemplate(prompt.systemContext, replacements);
    const userPrompt = applyTemplate(prompt.contentTemplate, replacements);
    
    console.info('Anthropic request - systemContext:', systemContext);
    console.info('Anthropic request - userPrompt:', userPrompt);
    
    const anthropic = new Anthropic({
      // apiKey is automatically loaded from environment
    });
    
    const premiumModelName = process.env.LLM_PREMIUM_MODEL_NAME === undefined ? 'claude-3-5-sonnet-20241022' : process.env.LLM_PREMIUM_MODEL_NAME;
    
    const msg = await anthropic.messages.create({
      model: premiumModelName,
      max_tokens: 4096,
      system: systemContext,
      messages: [
        { 
          role: "user", 
          content: userPrompt
        }
      ],
    });
    
    let storyElement = '';
    let shortId = '';
    let storyElementId = '';
    
    if (msg.content[0].type === 'text') {
      storyElement = msg.content[0].text.trim();
      console.info('Anthropic response length:', storyElement.length);
      
      shortId = generateShortId(tokenId);
      
      while (true) {
        const existingWithShortId = await collection.findOne({ shortId });
        if (!existingWithShortId) break;
        shortId = generateShortId(tokenId);
      }
      
      await collection.updateMany(
        { tokenId },
        { $set: { isActive: false } }
      );
      
      const result = await collection.insertOne({
        tokenId,
        shortId,
        storyElement,
        walletAddress: walletAddress || 'unknown',
        nftContext: {
          name: characterFullName,
          attributes,
          elementDetails
        },
        characterName: characterNameObj,
        nftTitle,
        model: premiumModelName,
        createdAt: new Date(),
        isActive: true,
        refinementStage: 'unrefined',
        seLmVersion: SeLmVersion,
        elementType,
        promptId: prompt._id
      } as StoryElementDocument);
      
      storyElementId = result.insertedId.toString();
    } else {
      storyElement = 'Failed to generate storyElement. Please try again.';
    }
    
    return NextResponse.json({ 
      storyElement,
      storyElementId,
      shortId,
      model: premiumModelName,
      isActive: true,
      refinementStage: 'unrefined',
      elementType,
      promptId: prompt._id.toString()
    });
  } catch (error) {
    console.error('Error generating storyElement:', error);
    return NextResponse.json({ 
      error: 'Failed to generate storyElement. Please try again.' 
    }, { status: 500 });
  }
}