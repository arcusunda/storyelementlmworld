// api/anthropic/generate-tweet/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getCollection } from '@/utils/mongodb';
import { SeLmVersion } from '@/utils/utils';
import { getActivePrompt } from '@/utils/promptUtils';

export const maxDuration = 15;

interface TweetGenerationRequest {
  characterName: string;
  backstory: string;
  tokenId: string;
  backstoryId?: string;
  shortId?: string;
  walletAddress?: string;
}

interface TweetDocument {
  tokenId: string;
  backstoryId: string;
  shortId?: string;
  characterName: string;
  tweet: string;
  model: string;
  walletAddress: string;
  createdAt: Date;
  seLmVersion?: string;
  promptId?: string;
}

const containsInappropriateContent = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  const inappropriatePatterns = [
    /\b(nsfw|explicit)\b/,
  ];
  return inappropriatePatterns.some(pattern => pattern.test(lowerText));
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
    const body: TweetGenerationRequest = await request.json();
    const { characterName, backstory, tokenId, backstoryId: providedBackstoryId, shortId, walletAddress } = body;
    
    if (!backstory || !characterName) {
      return NextResponse.json({ 
        error: 'Invalid request data. Missing backstory or character name.' 
      }, { status: 400 });
    }
    
    if (containsInappropriateContent(backstory) || containsInappropriateContent(characterName)) {
      return NextResponse.json({ 
        error: 'Request contains inappropriate content.' 
      }, { status: 400 });
    }
    
    let backstoryId = providedBackstoryId;
    if (!backstoryId) {
      try {
        const collection = await getCollection('backstories');
        
        const query = {
          tokenId: tokenId,
          backstory: backstory
        };
        
        const result = await collection.findOne(query, { sort: { createdAt: -1 } });
        
        if (result) {
          backstoryId = result._id.toString();
          console.log(`Found backstoryId ${backstoryId} for tokenId ${tokenId}`);
        } else {
          console.log(`No backstory found for tokenId ${tokenId} with matching text`);
        }
      } catch (error) {
        console.error('Error finding backstoryId:', error);
      }
    }
    
    if (backstoryId) {
      try {
        const tweetsCollection = await getCollection('tweets');
        const existingTweet = await tweetsCollection.findOne({ 
          backstoryId,
          tokenId
        });
        
        if (existingTweet) {
          return NextResponse.json({
            tweet: existingTweet.tweet,
            tweetId: existingTweet._id.toString(),
            backstoryId: backstoryId,
            isExisting: true,
            SeLmVersion: existingTweet.SeLmVersion || 'unknown',
            promptId: existingTweet.promptId || 'unknown'
          });
        }
      } catch (error) {
        console.error('Error checking for existing tweet:', error);
      }
    }
    
    const prompt = await getActivePrompt('tweet');
    
    if (!prompt) {
      return NextResponse.json({ 
        error: 'No active prompt template found for tweet generation.' 
      }, { status: 500 });
    }
    
    const systemContext = applyTemplate(prompt.systemContext, {
      characterName
    });
    
    const content = applyTemplate(prompt.contentTemplate, {
      characterName,
      tokenId,
      backstory
    });
    
    const anthropic = new Anthropic({
      // apiKey is automatically loaded from environment
    });
    
    const premiumModelName = process.env.LLM_PREMIUM_MODEL_NAME === undefined ? 'claude-3-5-sonnet-20241022' : process.env.LLM_PREMIUM_MODEL_NAME;
    
    console.info('Anthropic request - content:', content);
    console.info('Anthropic request - systemContext:', systemContext);
    
    const msg = await anthropic.messages.create({
      model: premiumModelName,
      max_tokens: 300,
      temperature: 0.8,
      system: systemContext,
      messages: [
        { 
          role: "user", 
          content: content
        }
      ],
    });
    
    let tweetContent = '';
    if (msg.content[0].type === 'text') {
      tweetContent = msg.content[0].text.trim();
      
      if (tweetContent.length > 200) {
        tweetContent = tweetContent.substring(0, 197) + '...';
      }
    } else {
      tweetContent = `Meet ${characterName}, a mysterious Muerto with a story that will haunt you. Read the full tale...`;
    }
    
    let tweetId = '';
    if (tweetContent) {
      try {
        const tweetsCollection = await getCollection('tweets');
        
        const tweetDocument: TweetDocument = {
          tokenId,
          backstoryId: backstoryId || 'unknown',
          shortId: shortId,
          characterName,
          tweet: tweetContent,
          model: premiumModelName,
          walletAddress: walletAddress || 'unknown',
          createdAt: new Date(),
          seLmVersion: SeLmVersion,
          promptId: (prompt._id as string).toString()
        };
        
        const result = await tweetsCollection.insertOne(tweetDocument);
        tweetId = result.insertedId.toString();
        
        console.log(`Saved tweet for ${characterName} (Muerto #${tokenId}) with ID: ${tweetId}`);
      } catch (error) {
        console.error('Error saving tweet to database:', error);
      }
    }
    
    return NextResponse.json({ 
      tweet: tweetContent,
      backstoryId: backstoryId,
      tweetId: tweetId,
      seLmVersion: SeLmVersion,
      promptId: (prompt._id as string).toString()
    });
  } catch (error) {
    console.error('Error generating tweet:', error);
    return NextResponse.json({ 
      error: 'Failed to generate tweet. Please try again.' 
    }, { status: 500 });
  }
}