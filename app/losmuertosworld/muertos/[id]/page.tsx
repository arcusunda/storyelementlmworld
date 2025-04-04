"use client"
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image'
import MuertosAIChat from './components/MuertosAIChat';
import ElementStatusIndicator from './components/ElementStatusIndicator';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import PriceDisplay from './components/PriceDisplay';
import TraitsDisplay from './components/TraitsDisplay';

interface Attribute {
  trait_type: string;
  value: string;
}

interface RarityScore {
  _id: string;
  nftName: string;
  imageUrl: string;
  totalScore: number;
  rank: number;
  trait_scores: Record<string, number>;
  trait_rarities: Record<string, number>;
  calculated_at: string;
  tokenId?: string;
  _class: string;
}

interface NFTMetadata {
  name: string;
  image: string;
  attributes: Attribute[];
}

const MuertosDetails = () => {
    const params = useParams();
    const router = useRouter();
    const tokenId = parseInt(Array.isArray(params?.id) ? params.id[0] : params?.id || "0", 10);
    const [headwearDetails, setHeadwearDetails] = useState<StoryElement | null>(null);
    const [maskDetails, setMaskDetails] = useState<StoryElement | null>(null);
    const [bodyDetails, setBodyDetails] = useState<StoryElement | null>(null);
    const [expressionDetails, setExpressionDetails] = useState<StoryElement | null>(null);
    
    const elementDetails = {
      headwear: headwearDetails,
      body: bodyDetails,
      mask: maskDetails,
      expression: expressionDetails
    };

  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rarityData, setRarityData] = useState<RarityScore | null>(null);

  useEffect(() => {
    if (tokenId) {
      fetchNFTMetadata(tokenId as number);
      fetchRarityData(tokenId as number)
    }
  }, [tokenId]);

  const fetchRarityData = async (tokenId: number) => {
    try {
      const response = await fetch(`/api/rarity?id=${tokenId}`);
      if (!response.ok) throw new Error('Failed to fetch rarity');
      const data = await response.json();
      setRarityData(data);
    } catch (error) {
      console.error('Error fetching rarity:', error);
    }
  };

  const fetchNFTMetadata = async (tokenId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/muertos/${tokenId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch muertos');
      }

      const data = await response.json();
      setMetadata(data);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  type StoryElementType = 'headwear' | 'body' | 'mask' | 'expression';

  interface StoryElement {
    id: number;
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
    attributeImage: string;
    category: string;
    prices?: Array<{
      priceDecimal: number;
      priceUsd: number;
      tokenId: string;
      sourceName: string;
      sourceUrl: string;
      timestamp: string;
      orderTimestampAt: string;
    }>;
  }
  
  interface ErrorResponse {
    error: string;
  }
  
  const REQUIRED_ATTRIBUTES = ['Body'] as const;

  interface ErrorResponse {
    error: string;
  }
  
  const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null;
  };
  
  const isErrorResponse = (data: unknown): data is ErrorResponse => {
    return isObject(data) && 
           'error' in data && 
           typeof data.error === 'string';
  };
    
  interface StoryElementAttribute {
    trait_type: string;
    value: string;
  }
  
  const isStoryElementAttribute = (attr: unknown): attr is StoryElementAttribute => {
    return isObject(attr) &&
           'trait_type' in attr &&
           'value' in attr &&
           typeof attr.trait_type === 'string' &&
           typeof attr.value === 'string';
  };
  
  const isValidStoryElement = (data: unknown): data is StoryElement => {
    return (
      isObject(data) &&
      'id' in data &&
      'name' in data &&
      'attributes' in data &&
      typeof data.id === 'number' &&
      typeof data.name === 'string' &&
      Array.isArray(data.attributes) &&
      data.attributes.length > 0 &&
      data.attributes.every(isStoryElementAttribute)
    );
  };

  const fetchStoryElement = async (
    attributeName: string,
    elementType: StoryElementType,
    setElement: (data: StoryElement | null) => void,
    setLoading: (loading: boolean) => void
  ) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/traits?attributeName=${encodeURIComponent(attributeName)}`);
      const data = await response.json();
  
      if (isErrorResponse(data)) {
        console.log(`Trait ${elementType} not found:`, data.error);
        setElement(null);
        return;
      }
      
      if (isValidStoryElement(data)) {
        setElement(data);
      } else {
        console.error(`Invalid ${elementType} details data received:`, data);
        setElement(null);
      }
    } catch (error) {
      console.error(`Error fetching ${elementType} details:`, error);
      setElement(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (metadata) {
      const fetchElementIfExists = (
        traitType: string, 
        elementType: StoryElementType, 
        setterFunction: (data: StoryElement | null) => void
      ) => {
        const attribute = metadata.attributes.find(attr => attr.trait_type === traitType)?.value;
        if (attribute) {
          fetchStoryElement(attribute, elementType, setterFunction, setLoading);
        } else {
          if (REQUIRED_ATTRIBUTES.includes(traitType as typeof REQUIRED_ATTRIBUTES[number])) {
            console.warn(`Required attribute ${traitType} not found in metadata`);
          } else {
            console.log(`Optional attribute ${traitType} not present in metadata`);
          }
            setterFunction(null);
        }
      };
  
      fetchElementIfExists('Body', 'body', setBodyDetails);
      fetchElementIfExists('Headwear', 'headwear', setHeadwearDetails);
      fetchElementIfExists('Mask', 'mask', setMaskDetails);
      fetchElementIfExists('Expression', 'expression', setExpressionDetails);
    }
  }, [metadata]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
            {/* Left Column Skeleton */}
            <div className="lg:w-1/3">
              <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="aspect-square bg-gray-700" />
                <div className="p-6 space-y-4">
                  <div className="h-8 bg-gray-700 rounded-lg w-3/4" />
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-700 rounded w-1/2" />
                    <div className="grid grid-cols-2 gap-3">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-700 rounded-lg" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Right Column Skeleton */}
            <div className="lg:flex-1 space-y-6">
              <div className="bg-gray-800 rounded-xl p-6 h-32" />
              <div className="bg-gray-800 rounded-xl p-6 h-96" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!metadata) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">NFT Metadata not found.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 bg-gray-700 text-white px-4 py-2 rounded"
        >
          Back to Home
        </button>
      </main>
    );
  }

  const getPinataUrl = (ipfsUrl: string | undefined) => {
    if (!ipfsUrl) {
      console.warn('Received undefined or empty ipfsUrl');
      return '/placeholder-image.jpg';
    }
  
    try {
      const [ipfsHash, filename] = ipfsUrl
        .replace('ipfs://', '')
        .split('/');
      return `https://gateway.pinata.cloud/ipfs/${ipfsHash}/${filename}`;
    } catch (error) {
      console.error('Error parsing ipfsUrl:', error, 'ipfsUrl:', ipfsUrl);
      return '/placeholder-image.jpg';
    }
  };  

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
  
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Muerto Details */}
          <div className="lg:w-1/3">
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden sticky top-24">
              {/* NFT Image with gradient overlay */}
              <div className="relative">
                <Image
                  src={getPinataUrl(metadata.image)}
                  alt={metadata.name}
                  width={500}
                  height={500}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent opacity-60" />
              </div>
  
              {/* NFT Details */}
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4 text-white">{metadata.name}</h1>
                
                <div className="space-y-4">
                <TraitsDisplay 
      metadata={metadata}
      elementDetails={elementDetails}
      rarityData={rarityData}
    />

                  <PriceDisplay 
                    tokenId={tokenId} elementDetails={{
                      headwear: null,
                      body: null,
                      mask: null,
                      expression: null
                    }}                  />
                </div>
              </div>
            </div>
          </div>
  
          {/* Right Column - Status and Chat */}
          <div className="lg:flex-1 space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <ElementStatusIndicator 
                elementDetails={elementDetails} 
                metadata={metadata} 
              />
            </div>
  
            <div className="bg-gray-800 rounded-xl shadow-lg">
              <MuertosAIChat 
                metadata={metadata} 
                elementDetails={elementDetails}
                tokenId={tokenId}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
      </div>
  );
};

export default MuertosDetails;
