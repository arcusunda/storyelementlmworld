// api/anthropic/storyelement-generate-tweet/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getCollection } from '@/utils/mongodb';
import { SeLmVersion } from '@/utils/utils';

export const maxDuration = 15;

interface TweetGenerationRequest {
  characterName: string;
  storyElement: string;
  tokenId: string;
  storyElementId?: string;
  shortId?: string;
  walletAddress?: string;
}

interface TweetDocument {
  tokenId: string;
  storyElementId: string;
  shortId?: string;
  characterName: string;
  tweet: string;
  model: string;
  walletAddress: string;
  createdAt: Date;
  seLmVersion?: string;
}

const containsInappropriateContent = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  const inappropriatePatterns = [
    /\b(nsfw|explicit)\b/,
  ];
  return inappropriatePatterns.some(pattern => pattern.test(lowerText));
};

export async function POST(request: NextRequest) {
  try {
    const body: TweetGenerationRequest = await request.json();
    const { characterName, storyElement, tokenId, storyElementId: providedStoryElementId, shortId, walletAddress } = body;
    
    if (!storyElement || !characterName) {
      return NextResponse.json({ 
        error: 'Invalid request data. Missing storyElement or character name.' 
      }, { status: 400 });
    }
    
    if (containsInappropriateContent(storyElement) || containsInappropriateContent(characterName)) {
      return NextResponse.json({ 
        error: 'Request contains inappropriate content.' 
      }, { status: 400 });
    }
    
    let storyElementId = providedStoryElementId;
    if (!storyElementId) {
      try {
        const collection = await getCollection('rawStoryElements');
        
        const query = {
          tokenId: tokenId,
          storyElement: storyElement
        };
        
        const result = await collection.findOne(query, { sort: { createdAt: -1 } });
        
        if (result) {
          storyElementId = result._id.toString();
          console.log(`Found storyElementId ${storyElementId} for tokenId ${tokenId}`);
        } else {
          console.log(`No storyElement found for tokenId ${tokenId} with matching text`);
        }
      } catch (error) {
        console.error('Error finding storyElementId:', error);
      }
    }
    
    if (storyElementId) {
      try {
        const tweetsCollection = await getCollection('tweets');
        const existingTweet = await tweetsCollection.findOne({ 
          storyElementId,
          tokenId
        });
        
        if (existingTweet) {
          return NextResponse.json({
            tweet: existingTweet.tweet,
            tweetId: existingTweet._id.toString(),
            storyElementId: storyElementId,
            isExisting: true,
            SeLmVersion: existingTweet.SeLmVersion || 'unknown'
          });
        }
      } catch (error) {
        console.error('Error checking for existing tweet:', error);
      }
    }
    
    const systemContext = `
You are a tweet writer for Los Muertos World, an NFT collection featuring colorful characters inspired by Día de los Muertos. 
Your task is to create a compelling, engaging tweet to share a character's backstory.

Guidelines for creating the tweet:
1. Create a tweet with a dark humor tone that would intrigue people to check out the character.
2. The tweet MUST be under 200 characters total (not including the URL which will be added separately).
3. Use an attention-grabbing, witty format that makes people want to learn more.
4. Include the character's name (${characterName}).
5. Do not use hashtags in the tweet.
6. The tone should be darkly whimsical, not truly horrific or disturbing.
7. Capture the most interesting aspect of the character's storyElement to hook readers.
8. Make it mysterious and intriguing - like a teaser that makes people want to read the full story.
9. Be creative, memorable, and unique.

The tweet should be just the text with no additional formatting, quotation marks, or comments.`;
    
    const anthropic = new Anthropic({
      // apiKey is automatically loaded from environment
    });
    
    const premiumModelName = process.env.LLM_PREMIUM_MODEL_NAME === undefined ? 'claude-3-5-sonnet-20241022' : process.env.LLM_PREMIUM_MODEL_NAME;
    
    const msg = await anthropic.messages.create({
      model: premiumModelName,
      max_tokens: 300,
      temperature: 0.8,
      system: systemContext,
      messages: [
        { 
          role: "user", 
          content: `Here's the storyElement for ${characterName}, Muerto #${tokenId}:\n\n${storyElement}\n\nPlease create a clever, intriguing tweet (under 200 characters) with dark humor that would make people want to read more about this character.` 
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
          storyElementId: storyElementId || 'unknown',
          shortId: shortId,
          characterName,
          tweet: tweetContent,
          model: premiumModelName,
          walletAddress: walletAddress || 'unknown',
          createdAt: new Date(),
          seLmVersion: SeLmVersion
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
      storyElementId: storyElementId,
      tweetId: tweetId,
      seLmVersion: SeLmVersion
    });
  } catch (error) {
    console.error('Error generating tweet:', error);
    return NextResponse.json({ 
      error: 'Failed to generate tweet. Please try again.' 
    }, { status: 500 });
  }
}