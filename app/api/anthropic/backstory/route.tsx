// api/anthropic/backstory/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getCollection } from '@/utils/mongodb';
import { SeLmVersion } from '@/utils/utils';

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

interface BackstoryChoices {
  origin?: string;
  purpose?: string;
  emotional?: string;
  relationship?: string;
  archetype?: string;
  isRandom: boolean;
}

interface BackstoryRequest {
  tokenId: string;
  name: string;
  nftTitle?: string;
  attributes: NFTAttribute[];
  elementDetails: ElementDetail[];
  walletAddress?: string;
  characterName?: {
    firstName: string;
    lastName: string;
  };
  backstoryChoices?: BackstoryChoices;
  forceRegenerate?: boolean;
}

interface BackstoryDocument {
  tokenId: string;
  shortId: string;
  backstory: string;
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
  backstoryChoices?: BackstoryChoices;
  nftTitle?: string;
  model: string;
  createdAt: Date;
  isActive: boolean;
  refinementStage: string;
}

interface PromptDocument {
  _id: any;
  type: string;
  version: string;
  active: boolean;
  name: string;
  systemContext: string;
  contentTemplate: string;
  createdAt: Date;
  updatedAt: Date;
}

export const maxDuration = 60;

const generateShortId = (tokenId: string): string => {
  const randomSuffix = Math.random()
    .toString(36)
    .substring(2, 7);
  
  return `${tokenId}-${randomSuffix}`;
};

const containsInappropriateContent = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  const inappropriatePatterns = [
    /\b(nsfw|explicit)\b/,
  ];
  return inappropriatePatterns.some(pattern => pattern.test(lowerText));
};

const generateBackstoryGuidance = (choices: BackstoryChoices | undefined): string => {
  if (!choices || choices.isRandom) {
    return '';
  }

  let guidance = 'BACKSTORY DIRECTION GUIDANCE:\n';
  
  if (choices.origin) {
    switch (choices.origin) {
      case 'heroicSacrifice':
        guidance += '- Origin: This character died as a result of a heroic sacrifice, protecting someone or something they deeply loved. Their transition to The Violet Reaches should reflect this noble act and the emotional weight it carries.\n';
        break;
      case 'tragicAccident':
        guidance += '- Origin: This character\'s life ended in a sudden, unexpected accident that left much unfinished business. Their arrival in The Violet Reaches is marked by this sense of interruption and lingering connection to unresolved matters.\n';
        break;
      case 'peacefulTransition':
        guidance += '- Origin: This character experienced a peaceful end after a fulfilled life, yet maintains connections to the living world. Their presence in The Violet Reaches reflects a gentle transition rather than abrupt severance.\n';
        break;
      case 'mysteriousDisappearance':
        guidance += '- Origin: This character vanished from the living world under mysterious circumstances. Their existence in The Violet Reaches is marked by uncertainty about their own transition and a quest to understand what truly happened.\n';
        break;
    }
  }
  
  if (choices.purpose) {
    switch (choices.purpose) {
      case 'artistCreator':
        guidance += '- Purpose: As an artist or creator, this character is driven to leave a lasting legacy through creative expression. In The Violet Reaches, they continue to create, perhaps finding new mediums that transcend physical limitations.\n';
        break;
      case 'guardianProtector':
        guidance += '- Purpose: This character is a guardian or protector, fundamentally driven to watch over loved ones or sacred places. In The Violet Reaches, they maintain this protective role, perhaps now with greater insight or power.\n';
        break;
      case 'explorerAdventurer':
        guidance += '- Purpose: An explorer or adventurer at heart, this character is motivated by discovery and new experiences. The Violet Reaches offers boundless opportunities for exploration beyond what was possible in life.\n';
        break;
      case 'healerNurturer':
        guidance += '- Purpose: This character finds meaning in healing and nurturing others. In The Violet Reaches, they continue this calling, perhaps helping other souls in transition or healing the realm itself.\n';
        break;
      case 'scholarSeeker':
        guidance += '- Purpose: As a scholar or seeker of knowledge, this character searches for hidden truths and universal wisdom. The Violet Reaches offers access to understanding that transcends mortal limitations.\n';
        break;
    }
  }
  
  if (choices.emotional) {
    switch (choices.emotional) {
      case 'seekingRedemption':
        guidance += '- Emotional Journey: This character is seeking redemption for past actions or failures, trying to right wrongs or find forgiveness that eluded them in life.\n';
        break;
      case 'lostConnection':
        guidance += '- Emotional Journey: This character is driven by a lost connection, seeking to reconnect with someone they were separated from, whether another soul in The Violet Reaches or someone still in the living world.\n';
        break;
      case 'unfulfilledPromise':
        guidance += '- Emotional Journey: This character is bound by an unfulfilled promise or vow they made in life. Their existence in The Violet Reaches is partly defined by their need to honor this commitment.\n';
        break;
      case 'unsolvedMystery':
        guidance += '- Emotional Journey: This character is compelled to solve a mystery or uncover a truth from their past. The Violet Reaches may offer revelations unavailable to them in life.\n';
        break;
    }
  }
  
  if (choices.relationship) {
    switch (choices.relationship) {
      case 'ancestralGuardian':
        guidance += '- Relationship to The Violet Reaches: This character has deep ancestral ties to this realm, perhaps with generations of family members who have dwelled here before them, giving them special insight or authority.\n';
        break;
      case 'accidentalWanderer':
        guidance += '- Relationship to The Violet Reaches: This character stumbled upon this realm by chance, without preparation or foreknowledge. Their perspective is marked by wonder, confusion, and gradual understanding.\n';
        break;
      case 'chosenOne':
        guidance += '- Relationship to The Violet Reaches: This character was specifically called to this realm for a greater purpose. They may possess unique abilities or insights vital to The Violet Reaches.\n';
        break;
      case 'nativeSpirit':
        guidance += '- Relationship to The Violet Reaches: Unlike most visitors, this character has always belonged to this mystical dimension. They embody its essence and understand its nature in ways others cannot.\n';
        break;
    }
  }
  
  if (choices.archetype) {
    switch (choices.archetype) {
      case 'rebel':
        guidance += '- Character Archetype: This character embodies The Rebel, challenging traditions and established order even in The Violet Reaches. They question, provoke, and seek to transform aspects of this realm they find unjust or restrictive.\n';
        break;
      case 'mentor':
        guidance += '- Character Archetype: This character embodies The Mentor, guiding others with wisdom and experience. In The Violet Reaches, they help new arrivals adjust and understand their new existence.\n';
        break;
      case 'innocent':
        guidance += '- Character Archetype: This character embodies The Innocent, bringing a fresh perspective and uncorrupted viewpoint to The Violet Reaches. Their unique way of seeing may reveal truths others miss.\n';
        break;
      case 'trickster':
        guidance += '- Character Archetype: This character embodies The Trickster, using wit and cleverness to navigate challenges. In The Violet Reaches, they may bend or play with the rules of this realm in unexpected ways.\n';
        break;
      case 'caregiver':
        guidance += '- Character Archetype: This character embodies The Caregiver, placing others\' needs before their own. In The Violet Reaches, they provide emotional support and comfort to other souls.\n';
        break;
    }
  }
  
  guidance += '\nIntegrate these elements organically into the backstory, creating a coherent narrative that feels true to the character while incorporating these specific aspects.';
  
  return guidance;
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
    const body: BackstoryRequest = await request.json();
    const { 
      tokenId, 
      name: characterName, 
      nftTitle, 
      attributes, 
      elementDetails, 
      walletAddress,
      characterName: characterNameObj,
      backstoryChoices,
      forceRegenerate = false
    } = body;
    
    if (!tokenId || !elementDetails || elementDetails.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid request data. Missing tokenId or element details.' 
      }, { status: 400 });
    }
    
    if (containsInappropriateContent(characterName)) {
      return NextResponse.json({ 
        error: 'Request contains inappropriate content. Please try again with appropriate content.' 
      }, { status: 400 });
    }
    
    const collection = await getCollection('backstories');
    
    if (characterNameObj?.firstName && characterNameObj?.lastName) {
      const duplicateNameCheck = await collection.findOne({
        'characterName.firstName': characterNameObj.firstName,
        'characterName.lastName': characterNameObj.lastName,
        tokenId: { $ne: tokenId }
      });
      
      if (duplicateNameCheck) {
        return NextResponse.json({ 
          error: 'This character name combination is already in use. Please choose a different first name.' 
        }, { status: 400 });
      }
    }
    
    if (!forceRegenerate) {
      const existingBackstory = await collection.findOne({
        tokenId,
        'nftContext.name': characterName,
        'characterName.firstName': characterNameObj?.firstName,
        'characterName.lastName': characterNameObj?.lastName,
        isActive: true
      });
      
      if (existingBackstory) {
        return NextResponse.json({ 
          backstory: existingBackstory.backstory,
          backstoryId: existingBackstory._id.toString(),
          shortId: existingBackstory.shortId,
          isExisting: true,
          model: existingBackstory.model,
          isActive: existingBackstory.isActive,
          refinementStage: existingBackstory.refinementStage,
          backstoryChoices: existingBackstory.backstoryChoices
        });
      }
    }
    
    const promptsCollection = await getCollection('prompts');
    const prompt = await promptsCollection.findOne({
      type: 'backstory',
      active: true
    }) as PromptDocument | null;
    
    if (!prompt) {
      return NextResponse.json({ 
        error: 'No active prompt template found for backstory generation.' 
      }, { status: 500 });
    }
    
    const elementDescriptions = elementDetails.map(element => 
      `${element.type}: ${element.name} - ${element.description} (Category: ${element.category})`
    ).join('\n\n');
    
    const attributesSummary = attributes
      .map(attr => `${attr.trait_type}: ${attr.value}`)
      .join(', ');
    
    const backstoryGuidance = generateBackstoryGuidance(backstoryChoices);
    
    const characterInfo = `
THE CHARACTER:
Name: ${characterName}
${characterNameObj ? `First Name: ${characterNameObj.firstName}
Last Name: ${characterNameObj.lastName}` : ''}
Title: ${nftTitle || characterName}
Key Attributes: ${attributesSummary}

VISUAL ELEMENTS TO INCORPORATE:
${elementDescriptions}

${backstoryGuidance}`;

    const systemContext = prompt.systemContext.replace(
      "You are a masterful writer in the tradition of magical realism",
      `You are a masterful writer in the tradition of magical realism\n\n${characterInfo}`
    );
    
    const content = applyTemplate(prompt.contentTemplate, {
      characterName
    });
    
    const anthropic = new Anthropic({
      // apiKey is automatically loaded from environment
    });
    
    const premiumModelName = process.env.LLM_PREMIUM_MODEL_NAME === undefined ? 'claude-3-5-sonnet-20241022' : process.env.LLM_PREMIUM_MODEL_NAME;
    
    console.info('Anthropic request - content:', content);
    console.info('Anthropic request - systemContext:', systemContext);
    
    const msg = await anthropic.messages.create({
      model: premiumModelName,
      max_tokens: 4096,
      system: systemContext,
      messages: [
        { 
          role: "user", 
          content: content 
        }
      ],
    });
    
    let backstory = '';
    let shortId = '';
    let backstoryId = '';
    
    if (msg.content[0].type === 'text') {
      backstory = msg.content[0].text.trim();
      console.info('Anthropic response length:', backstory.length);
      
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
        backstory,
        walletAddress: walletAddress || 'unknown',
        nftContext: {
          name: characterName,
          attributes,
          elementDetails
        },
        characterName: characterNameObj,
        backstoryChoices: backstoryChoices,
        nftTitle,
        model: premiumModelName,
        createdAt: new Date(),
        isActive: true,
        refinementStage: 'unrefined',
        seLmVersion: SeLmVersion,
        promptId: prompt._id
      } as BackstoryDocument);
      
      backstoryId = result.insertedId.toString();
    } else {
      backstory = 'Failed to generate backstory. Please try again.';
    }
    
    return NextResponse.json({ 
      backstory,
      backstoryId,
      shortId,
      model: premiumModelName,
      isActive: true,
      refinementStage: 'unrefined',
      backstoryChoices: backstoryChoices
    });
  } catch (error) {
    console.error('Error generating backstory:', error);
    return NextResponse.json({ 
      error: 'Failed to generate backstory. Please try again.' 
    }, { status: 500 });
  }
}