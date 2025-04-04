// /api/refinedstoryelements/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

const REFINEMENT_STAGES = [
  'unrefined',
  'animation_notes_added',
  'summary_created',
  'art_prompts_created',
  'structure_refined',
  'uniqueness_determined',
  'narrative_potential_assessed',
  'relationships_identified',
  'ip_assessed',
  'ipa_ready'
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wallet = searchParams.get('wallet');
    const tokenId = searchParams.get('tokenId');
    const elementId = searchParams.get('elementId');
    const shortId = searchParams.get('shortId');
    const elementType = searchParams.get('elementType');
    const stage = searchParams.get('stage');
    const minStage = searchParams.get('minStage');
    
    const collection = await getCollection(
      stage === 'unrefined' ? 'rawStoryElements' : 'storyElements'
    );
    
    let query: Record<string, unknown> = {};
    
    if (wallet) {
      query = { ...query, walletAddress: wallet };
    }
    
    if (tokenId) {
      query = { ...query, tokenId };
    }
    
    if (elementId) {
      try {
        query = { ...query, _id: new ObjectId(elementId) };
      } catch (error) {
        console.error('Invalid elementId format:', error);
        return NextResponse.json({ 
          error: 'Invalid elementId format' 
        }, { status: 400 });
      }
    }
    
    if (shortId) {
      query = { ...query, shortId };
    }
    
    if (elementType) {
      query = { ...query, elementType };
    }
    
    if (stage) {
      query = { ...query, refinementStage: stage };
    }
    
    if (minStage && REFINEMENT_STAGES.includes(minStage)) {
      const minStageIndex = REFINEMENT_STAGES.indexOf(minStage);
      const eligibleStages = REFINEMENT_STAGES.slice(minStageIndex);
      query = { ...query, refinementStage: { $in: eligibleStages } };
    }
    
    if (!stage && !minStage) {
      const displayableStages = [
        'narrative_potential_assessed',
        'relationships_identified',
        'ip_assessed',
        'ipa_ready'
      ];
      query = { ...query, refinementStage: { $in: displayableStages } };
    }
    
    const storyElements = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
      
    const formattedStoryElements = storyElements.map(element => ({
      id: element._id.toString(),
      tokenId: element.tokenId,
      shortId: element.shortId,
      nftTitle: element.nftTitle || `Los Muertos #${element.tokenId}`,
      elementTitle: element.elementTitle || '',
      elementType: element.elementType || '',
      description: element.description || element.storyElement || '',
      culturalInfluences: element.culturalInfluences || [],
      narrativePotential: element.narrativePotential || '',
      relationships: element.relationships || [],
      walletAddress: element.walletAddress,
      refinementStage: element.refinementStage || 'unrefined',
      
      ipRegistrationPotential: element.ipRegistrationPotential || 
                              (element.uniquenessAssessment ? {
                                uniqueness: element.uniquenessAssessment.uniquenessScore || 0,
                                worldBuilding: element.narrativePotentialAssessment?.overallScore || 0,
                                commercialPotential: element.ipAssessment?.overallScore || 0,
                                recommendedForRegistration: element.uniquenessAssessment?.uniquenessScore >= 8
                              } : {
                                uniqueness: 0,
                                worldBuilding: 0,
                                commercialPotential: 0,
                                recommendedForRegistration: false
                              }),
                              
      createdAt: element.createdAt,
      updatedAt: element.updatedAt || element.refinementTimestamp || element.createdAt,
      refinedAt: element.refinedAt,
      animationNotesAddedAt: element.animationNotesAddedAt || element.refinedAt,
      summaryCreatedAt: element.summaryCreatedAt,
      artPromptsCreatedAt: element.artPromptsCreatedAt,
      structureRefinedAt: element.structureRefinedAt,
      uniquenessDeterminedAt: element.uniquenessDeterminedAt,
      narrativePotentialAssessedAt: element.narrativePotentialAssessedAt,
      relationshipsIdentifiedAt: element.relationshipsIdentifiedAt,
      ipAssessedAt: element.ipAssessedAt,
      worldbuildingAssessedAt: element.worldbuildingAssessedAt,
      
      registeredAsIp: element.registeredAsIp || false,
      registrationDate: element.registrationDate || null,
      registrationTxHash: element.registrationTxHash || null,
      
      animationNotes: element.animationNotes || null,
      summary: element.summary || null,
      artPrompts: element.artPrompts || null,
      uniquenessAssessment: element.uniquenessAssessment || null,
      narrativePotentialAssessment: element.narrativePotentialAssessment || null,
      relationshipAssessment: element.relationshipAssessment || null,
      ipAssessment: element.ipAssessment || null,
      worldbuildingAssessment: element.worldbuildingAssessment || null,
    }));
    
    return NextResponse.json({ 
      storyElements: formattedStoryElements 
    });
  } catch (error) {
    console.error('Error fetching story elements:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch story elements.' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shortId, action, targetStage } = body;
    
    if (!shortId || !action) {
      return NextResponse.json({ 
        error: 'Missing required parameters' 
      }, { status: 400 });
    }
    
    const storyElementsCollection = await getCollection('storyElements');
    let element = await storyElementsCollection.findOne({ shortId });
    
    let collection = storyElementsCollection;
    if (!element) {
      const rawStoryElementsCollection = await getCollection('rawStoryElements');
      element = await rawStoryElementsCollection.findOne({ shortId });
      collection = rawStoryElementsCollection;
    }
    
    if (!element) {
      return NextResponse.json({ 
        error: `No story element found with shortId: ${shortId}` 
      }, { status: 404 });
    }
    
    switch (action) {
      case 'resetStage': {
        if (!targetStage || !REFINEMENT_STAGES.includes(targetStage)) {
          return NextResponse.json({ 
            error: 'Invalid target stage' 
          }, { status: 400 });
        }
        
        await collection.updateOne(
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
          message: `Element ${shortId} stage reset to ${targetStage}` 
        });
      }
      
      case 'retryRefinement': {
        await collection.updateOne(
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
      
      default:
        return NextResponse.json({ 
          error: `Unknown action: ${action}` 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating story element:', error);
    return NextResponse.json({ 
      error: 'Failed to update story element.' 
    }, { status: 500 });
  }
}