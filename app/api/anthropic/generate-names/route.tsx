import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getCollection } from '@/utils/mongodb';
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

interface NamesRequest {
  tokenId: string;
  attributes: NFTAttribute[];
  elementDetails: ElementDetail[];
}

const applyTemplate = (template: string, replacements: Record<string, string>) => {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
};

export async function POST(request: NextRequest) {
  try {
    console.log('Generate names API called');
    
    const body: NamesRequest = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { tokenId, attributes, elementDetails } = body;
    
    if (!tokenId) {
      console.error('Missing tokenId in request');
      return NextResponse.json({ 
        error: 'Invalid request data. Missing tokenId.' 
      }, { status: 400 });
    }
    
    if (!elementDetails || elementDetails.length === 0) {
      console.error('Missing or empty elementDetails in request');
      return NextResponse.json({ 
        error: 'Invalid request data. Missing element details.' 
      }, { status: 400 });
    }
    
    const elementDescriptions = elementDetails.map(element => 
      `${element.type}: ${element.name} - ${element.description} (Category: ${element.category})`
    ).join('\n\n');
    
    const attributesSummary = attributes
      .map(attr => `${attr.trait_type}: ${attr.value}`)
      .join(', ');
    
    const maskAttribute = attributes.find(attr => attr.trait_type === "Mask");
    const maskValue = maskAttribute ? String(maskAttribute.value) : "Unknown";
    
    const collection = await getCollection('backstories');
    const existingNames = await collection.find({
      'characterName.lastName': maskValue
    }, {
      projection: { 'characterName.firstName': 1 }
    }).toArray();
    
    const usedFirstNames = existingNames.map(doc => 
      doc.characterName?.firstName
    ).filter(Boolean);
    
    console.log(`Found ${usedFirstNames.length} existing first names for last name "${maskValue}":`, usedFirstNames);
    
    const prompt = await getActivePrompt('names');
    
    if (!prompt) {
      console.error('No active prompt found for names generation');
      return NextResponse.json({ 
        error: 'No active prompt template found for name generation.' 
      }, { status: 500 });
    }
    
    const systemContext = applyTemplate(prompt.systemContext, {
      attributesSummary,
      elementDescriptions,
      maskValue,
      usedFirstNames: usedFirstNames.join(', '),
      usedFirstNamesSection: usedFirstNames.length > 0 ? 
        `IMPORTANT: The following first names are ALREADY IN USE and cannot be reused with the last name "${maskValue}":\n${usedFirstNames.join(', ')}\n\nYou MUST NOT include any of these already used names in your suggestions.` : 
        ''
    });
    
    const content = applyTemplate(prompt.contentTemplate, {
      usedFirstNames: usedFirstNames.length > 0 ? 'Make sure to exclude any already used names.' : ''
    });
    
    console.log('Calling Anthropic API...');
    
    try {
      const regularModelName = process.env.LLM_REGULAR_MODEL_NAME === undefined ? 'claude-3-5-sonnet-20241022' : process.env.LLM_REGULAR_MODEL_NAME;

      const anthropic = new Anthropic({
        // apiKey is automatically loaded from environment
      });
      
      console.info('Anthropic request - content:', content);
      console.info('Anthropic request - systemContext:', systemContext);
      
      const msg = await anthropic.messages.create({
        model: regularModelName,
        max_tokens: 500,
        system: systemContext,
        messages: [
          { 
            role: "user", 
            content: content
          }
        ],
      });
      
      let firstNames: string[] = [];
      if (msg.content[0].type === 'text') {
        try {
          const content = msg.content[0].text.trim();
          console.log('Anthropic response:', content);
          
          const jsonMatch = content.match(/\[([\s\S]*)\]/);
          if (jsonMatch) {
            try {
              firstNames = JSON.parse(jsonMatch[0]);
            } catch (e) {
              console.error('Error parsing JSON from Anthropic response:', e);
            }
          } 
          
          if (!firstNames.length) {
            const lines = content.split('\n').filter(line => 
              line.trim() && !line.trim().startsWith('[') && !line.trim().startsWith(']')
            );
            
            firstNames = lines.map(line => {
              return line.replace(/^["\s\d\-\*\•]+|["\s\,\.]+$/g, '').trim();
            }).filter(name => name.length > 0);
          }
        } catch (error) {
          console.error('Error processing Anthropic response:', error);
        }
      }
      
      firstNames = firstNames.filter(name => !usedFirstNames.includes(name));
      
      if (firstNames.length === 0) {
        console.log('Using default names as fallback');
        const defaultOptions = ["Alma", "Luna", "Carlos", "Vicente", "Diego", "Frida", "Miguel", "Mariposa", "Rosa", "Felix", "Zara", "Mateo", "Elena", "Dante", "Lucia", "Rafael"];
        firstNames = defaultOptions.filter(name => !usedFirstNames.includes(name)).slice(0, 4);
        
        if (firstNames.length === 0) {
          firstNames = defaultOptions.map((name, index) => `${name}${index + 1}`).slice(0, 4);
        }
      }
      
      console.log(`Generated ${firstNames.length} unique names successfully`);
      return NextResponse.json({ 
        firstNames, 
        lastName: maskValue,
        promptId: (prompt._id as { toString: () => string }).toString()
      });
      
    } catch (anthropicError) {
      console.error('Anthropic API error:', anthropicError);
      
      const defaultOptions = ["Alma", "Diego", "Luna", "Miguel", "Frida", "Carlos", "Mariposa", "Vicente"];
      const availableNames = defaultOptions.filter(name => !usedFirstNames.includes(name));
      
      const fallbackNames = availableNames.length > 0 
        ? availableNames.slice(0, Math.min(availableNames.length, 8))
        : defaultOptions.map((name, index) => `${name}${index + 1}`).slice(0, 8);
      
      return NextResponse.json({ 
        firstNames: fallbackNames,
        lastName: maskValue,
        note: "Generated using fallback names due to API error"
      });
    }
    
  } catch (error) {
    console.error('Error in generate-names API:', error);
    return NextResponse.json({ 
      error: 'Failed to generate character names. Please try again.' 
    }, { status: 500 });
  }
}