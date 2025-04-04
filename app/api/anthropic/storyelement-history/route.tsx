// api/anthropic/storyelement-history/route.tsx
import { NextRequest, NextResponse } from 'next/server'; 
import { getCollection } from '@/utils/mongodb';  

export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get('wallet');
    const tokenId = request.nextUrl.searchParams.get('tokenId');
    
    if (!wallet) {
      return NextResponse.json({
        error: 'Wallet address is required'
      }, { status: 400 });
    }
    
    if (tokenId) {
      try {
        const nftResponse = await fetch(`${request.nextUrl.origin}/api/alchemy/fetchnft?tokenId=${tokenId}`);
        if (nftResponse.ok) {
          
          // Ownership check
          // if (nftData.nft && nftData.nft.owner && nftData.nft.owner.toLowerCase() === wallet.toLowerCase()) {
          //   userOwnsToken = true;
          // }
        }
      } catch (error) {
        console.warn(`Error verifying ownership of tokenId ${tokenId}:`, error);
      }
      
      const collection = await getCollection('rawStoryElements');
      const query = { tokenId };
      
      const rawStoryElements = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      
      let nftDetails = null;
      try {
        const nftResponse = await fetch(`${request.nextUrl.origin}/api/alchemy/fetchnft?tokenId=${tokenId}`);
        if (nftResponse.ok) {
          const nftData = await nftResponse.json();
          nftDetails = nftData.nft;
        }
      } catch (error) {
        console.warn(`Error fetching NFT details for tokenId ${tokenId}:`, error);
      }
      
      const history = rawStoryElements.map(item => ({
        tokenId: item.tokenId,
        shortId: item.shortId,
        name: item.nftContext?.name || `Los Muertos #${item.tokenId}`,
        nftTitle: item.nftTitle || item.nftContext?.name || `Los Muertos #${item.tokenId}`,
        characterName: item.characterName || undefined,
        storyElement: item.storyElement,
        createdAt: item.createdAt,
        creatorAddress: item.walletAddress || 'unknown',
        isOwnCreation: item.walletAddress === wallet,
        image: nftDetails?.image || undefined
      }));
      
      return NextResponse.json({ history });
    } 
    else {
      const nftResponse = await fetch(`${request.nextUrl.origin}/api/alchemy/fetchmetadata?wallet=${wallet}`);
      if (!nftResponse.ok) {
        throw new Error('Failed to fetch NFTs');
      }
      
      const nftData = await nftResponse.json();
      const ownedTokenIds = nftData.nfts?.map((nft: { tokenId: string }) => nft.tokenId) || [];
      
      if (ownedTokenIds.length === 0) {
        return NextResponse.json({ history: [] });
      }
      
      const collection = await getCollection('rawStoryElements');
      const rawStoryElements = await collection
        .find({ tokenId: { $in: ownedTokenIds } })
        .sort({ createdAt: -1 })
        .toArray();
      
      const history = rawStoryElements.map(item => ({
        tokenId: item.tokenId,
        name: item.nftContext?.name || `Los Muertos #${item.tokenId}`,
        nftTitle: item.nftTitle || item.nftContext?.name || `Los Muertos #${item.tokenId}`,
        characterName: item.characterName || undefined,
        storyElement: item.storyElement,
        createdAt: item.createdAt,
        creatorAddress: item.walletAddress || 'unknown',
        isOwnCreation: item.walletAddress === wallet,
        image: nftData.nfts?.find((nft: { tokenId: string; image?: string }) => nft.tokenId === item.tokenId)?.image || undefined
      }));
      
      return NextResponse.json({ history });
    }
  } catch (error) {
    console.error('Error fetching storyElement history:', error);
    return NextResponse.json({
      error: 'Failed to fetch storyElement history'
    }, { status: 500 });
  }
}