// api/storyelementrefinement/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { Document } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const stage = url.searchParams.get('stage') || null;
    const tokenId = url.searchParams.get('tokenId') || null;
    const search = url.searchParams.get('search') || null;

    const storyElementsCollection = await getCollection('storyElements');
    
    const pipeline: Document[] = [];
    
    const match: Record<string, unknown> = {};

    if (stage) {
      match.refinementStage = stage;
    }
    
    if (tokenId) {
      match.tokenId = tokenId;
    }
    
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      
      match.$or = [
        { 'elementTitle': searchRegex },
        { 'description': searchRegex },
        { 'tokenId': searchRegex },
        { 'shortId': searchRegex }
      ];
    }
    
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }
    
    pipeline.push({
      $project: {
        _id: 1,
        shortId: 1,
        tokenId: 1,
        elementTitle: 1,
        elementType: 1,
        refinementStage: 1,
        refinementFailed: 1,
        errorMessage: 1,
        refinementTimestamp: 1,
        artPromptsCreatedAt: 1,
        narrativePotentialAssessedAt: 1,
        uniquenessDeterminedAt: 1,
        structureRefinedAt: 1,
        relationshipsIdentifiedAt: 1,
        ipAssessedAt: 1,
        summaryCreatedAt: 1,
        animationNotesAddedAt: 1,
        createdAt: 1,
        updatedAt: 1,
        'nftContext.name': 1
      }
    });
    
    const stageCounts = await storyElementsCollection.aggregate([
      { $group: { _id: '$refinementStage', count: { $sum: 1 } } }
    ]).toArray();
    
    const stageCountsObj: Record<string, number> = {};
    for (const stageCount of stageCounts) {
      stageCountsObj[stageCount._id || 'unknown'] = stageCount.count;
    }
    
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });
    
    const elements = await storyElementsCollection.aggregate(pipeline).toArray();
    
    let totalCount = 0;
    
    if (stage) {
      totalCount = stageCountsObj[stage] || 0;
    } else {
      totalCount = Object.values(stageCountsObj).reduce((sum, count) => sum + count, 0);
    }
    
    return NextResponse.json({
      elements,
      stats: {
        totalCount,
        stageCounts: stageCountsObj
      }
    });
  } catch (error) {
    console.error('Error in story element refinement API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story element refinement data.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, shortId } = body;
    
    if (!action || !shortId) {
      return NextResponse.json(
        { error: 'Missing required parameters: action and shortId.' },
        { status: 400 }
      );
    }
    
    const storyElementsCollection = await getCollection('storyElements');
    
    const element = await storyElementsCollection.findOne({ shortId });
    
    if (!element) {
      return NextResponse.json(
        { error: `No story element found with shortId: ${shortId}` },
        { status: 404 }
      );
    }
    
    switch (action) {
      case 'resetStage': {
        const { targetStage } = body;
        
        if (!targetStage) {
          return NextResponse.json(
            { error: 'Missing targetStage parameter for resetStage action.' },
            { status: 400 }
          );
        }
        
        await storyElementsCollection.updateOne(
          { shortId },
          { 
            $set: { 
              refinementStage: targetStage,
              refinementFailed: false
            },
            $unset: { errorMessage: "" }
          }
        );
        
        return NextResponse.json({ 
          success: true, 
          message: `Element ${shortId} successfully reset to stage: ${targetStage}` 
        });
      }
      
      case 'retry': {
        await storyElementsCollection.updateOne(
          { shortId },
          { 
            $set: { refinementFailed: false },
            $unset: { errorMessage: "" }
          }
        );
        
        return NextResponse.json({ 
          success: true, 
          message: `Element ${shortId} marked for retry` 
        });
      }
      
      case 'viewDetails': {
        return NextResponse.json({ element });
      }
      
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in story element refinement API:', error);
    return NextResponse.json(
      { error: 'Failed to perform action on story element.' },
      { status: 500 }
    );
  }
}