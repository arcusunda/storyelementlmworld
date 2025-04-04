// api/admin/prompts/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { createPromptVersion, setPromptActive, updatePrompt } from '@/utils/promptUtils';
import { ObjectId } from 'mongodb';

/**
 * GET: Retrieve all prompts or prompts of a specific type
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    const collection = await getCollection('prompts');
    
    const query: Record<string, unknown> = {};
    if (type) query.type = type;
    if (activeOnly) query.active = true;
    
    console.info('Fetching prompts with query:', query);
    const prompts = await collection.find(query).sort({ type: 1, version: -1 }).toArray();
    
    console.info('Fetched prompts:', prompts);
    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

/**
 * POST: Create a new prompt or version of an existing prompt type
 */
export async function POST(request: NextRequest) {
  try {
    const { type, name, systemContext, contentTemplate, setActive = false } = await request.json();
    
    if (!type || !name || !systemContext || !contentTemplate) {
      return NextResponse.json({ 
        error: 'Missing required fields (type, name, systemContext, contentTemplate)' 
      }, { status: 400 });
    }
    
    const promptId = await createPromptVersion(
      type,
      name,
      systemContext,
      contentTemplate,
      setActive
    );
    
    return NextResponse.json({ 
      success: true,
      promptId,
      message: `Prompt created${setActive ? ' and set as active' : ''}`
    });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { promptId, name, systemContext, contentTemplate, setActive } = await request.json();
    
    if (!promptId) {
      return NextResponse.json({ error: 'Missing promptId' }, { status: 400 });
    }
    
    type PromptDocument = {
      name: string;
      systemContext: string;
      contentTemplate: string;
    };
    const updateData: Partial<Pick<PromptDocument, 'name' | 'systemContext' | 'contentTemplate'>> = {};
    if (name) updateData.name = name;
    if (systemContext) updateData.systemContext = systemContext;
    if (contentTemplate) updateData.contentTemplate = contentTemplate;
    
    const success = await updatePrompt(promptId, updateData);
    
    if (setActive) {
      await setPromptActive(promptId);
    }
    
    if (!success) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: `Prompt updated${setActive ? ' and set as active' : ''}`
    });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
  }
}

/**
 * PATCH: Set a prompt as active
 */
export async function PATCH(request: NextRequest) {
  try {
    const { promptId } = await request.json();
    
    if (!promptId) {
      return NextResponse.json({ error: 'Missing promptId' }, { status: 400 });
    }
    
    const success = await setPromptActive(promptId);
    
    if (!success) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Prompt set as active'
    });
  } catch (error) {
    console.error('Error activating prompt:', error);
    return NextResponse.json({ error: 'Failed to set prompt as active' }, { status: 500 });
  }
}

/**
 * DELETE: Delete a prompt (set to inactive rather than true deletion)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('id');
    
    if (!promptId) {
      return NextResponse.json({ error: 'Missing prompt id' }, { status: 400 });
    }
    
    const collection = await getCollection('prompts');
    const result = await collection.updateOne(
      { _id: new ObjectId(promptId) },
      { $set: { active: false, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Prompt deactivated'
    });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
  }
}