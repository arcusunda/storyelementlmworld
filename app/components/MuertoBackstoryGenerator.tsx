import React, { useState, useEffect, useCallback } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import Image from 'next/image';
import axios from 'axios';
import Link from 'next/link';
import { BookOpen, RefreshCw, Copy, CheckCircle2, Info, ChevronDown, ChevronUp, Zap, MessageSquare, Users, Play } from 'lucide-react';
import BackstoryHistory from './BackstoryHistory';
import BackstoryShareButton from './BackstoryShareButton';
import BackstorySelector from './BackstorySelector';
import { BackstoryChoices, DEFAULT_BACKSTORY_CHOICES } from './BackstoryTypes';

interface MuertoBackstoryGeneratorProps {
  tokenId?: string;
}

interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

interface NFTMetadata {
  tokenId: string;
  name?: string;
  image?: string;
  description?: string;
  attributes?: NFTAttribute[];
  error?: string;
  staked?: boolean;
  stakedAt?: number;
}

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
  category?: string;
}

interface AnimationNotes {
  visualQuirks?: string[];
  voicePatterns?: string[];
  relationshipDynamics?: string[];
  episodicPotential?: string[];
  rawNotes?: string[];
  parsingFailed?: boolean;
  generatedSeparately?: boolean;
}

interface BackstoryEntry {
  tokenId: string;
  name: string;
  nftTitle: string;
  backstory: string;
  createdAt: string;
  creatorAddress: string;
  isOwnCreation: boolean;
  shortId: string;
  isActive: boolean;
  animationNotes?: AnimationNotes;
  backstoryChoices?: BackstoryChoices;
  characterName?: {
    firstName: string;
    lastName: string;
  };
}

type StoryElementType = 'headwear' | 'body' | 'mask' | 'expression';

const REQUIRED_ATTRIBUTES = ['Body', 'Mask', 'Expression', 'Headwear'] as const;
const MAX_NAME_GENERATION_ATTEMPTS = 3;
const DEFAULT_FIRST_NAMES = ['Alma', 'Diego', 'Luna', 'Miguel', 'Frida', 'Carlos'];

interface MuertoBackstoryGeneratorProps {
  tokenId?: string;
}

export default function MuertoBackstoryGenerator({ tokenId: propTokenId }: MuertoBackstoryGeneratorProps) {
  const { isConnected, address } = useAppKitAccount();
  
  const [tokenId, setTokenId] = useState<string | null>(propTokenId || null);
  const [nftData, setNftData] = useState<NFTMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [backstory, setBackstory] = useState<string>('');
  const [backstoryShortId, setBackstoryShortId] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [existingBackstories, setExistingBackstories] = useState<BackstoryEntry[]>([]);
  const [hasExistingBackstory, setHasExistingBackstory] = useState(false);
  
  const [animationNotes, setAnimationNotes] = useState<AnimationNotes | null>(null);
  const [showAnimationNotes, setShowAnimationNotes] = useState(false);
  
  const [firstNameOptions, setFirstNameOptions] = useState<string[]>([]);
  const [selectedFirstName, setSelectedFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [loadingNames, setLoadingNames] = useState(false);
  const [nameGenerationAttempts, setNameGenerationAttempts] = useState<number>(0);
  const [nameError, setNameError] = useState<string>('');
  
  const [headwearDetails, setHeadwearDetails] = useState<StoryElement | null>(null);
  const [bodyDetails, setBodyDetails] = useState<StoryElement | null>(null);
  const [maskDetails, setMaskDetails] = useState<StoryElement | null>(null);
  const [expressionDetails, setExpressionDetails] = useState<StoryElement | null>(null);
  const [elementLoading, setElementLoading] = useState(false);
  
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const [backstoryChoices, setBackstoryChoices] = useState<BackstoryChoices>(DEFAULT_BACKSTORY_CHOICES);

  useEffect(() => {
    if (!propTokenId && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTokenId = urlParams.get('tokenId');
      if (urlTokenId) {
        setTokenId(urlTokenId);
      }
    }
  }, [propTokenId]);

  interface ErrorResponse {
    error: string;
  }

  const isErrorResponse = (data: unknown): data is ErrorResponse => {
    return typeof data === 'object' && 
          data !== null && 
          'error' in data && 
          typeof (data as ErrorResponse).error === 'string';
  };

  const isValidStoryElement = (data: unknown): data is StoryElement => {
    return typeof data === 'object' && 
          data !== null && 
          'id' in data && 
          typeof (data as StoryElement).id === 'number' &&
          'name' in data && 
          typeof (data as StoryElement).name === 'string' &&
          'attributes' in data && 
          Array.isArray((data as StoryElement).attributes);
  };  

  const fetchNFTByTokenId = useCallback(async () => {
    if (!tokenId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/alchemy/fetchnft?tokenId=${tokenId}`);
      if (response.data.nft) {
        setNftData(response.data.nft);
      } else {
        console.error('NFT not found');
      }
    } catch (error) {
      console.error('Error fetching NFT:', error);
    } finally {
      setLoading(false);
    }
  }, [tokenId]);
  
const fetchExistingBackstories = useCallback(async () => {
  if (!tokenId || !address) return;
  
  try {
    const response = await axios.get(`/api/anthropic/backstory-history?wallet=${address}&tokenId=${tokenId}`);
    
    if (response.data.history && response.data.history.length > 0) {
      setExistingBackstories(response.data.history);
      setHasExistingBackstory(true);
      
      const activeBackstory = response.data.history.find((backstory: BackstoryEntry) => backstory.isActive === true);
      
      const backstoryToUse = activeBackstory || response.data.history[0];
      
      setBackstory(backstoryToUse.backstory);
      
      if (backstoryToUse.shortId) {
        setBackstoryShortId(backstoryToUse.shortId);
      }
      
      if (backstoryToUse.animationNotes) {
        setAnimationNotes(backstoryToUse.animationNotes);
      }
      
      if (backstoryToUse.characterName) {
        setSelectedFirstName(backstoryToUse.characterName.firstName);
        if (!firstNameOptions.includes(backstoryToUse.characterName.firstName)) {
          setFirstNameOptions(prev => [...prev, backstoryToUse.characterName.firstName]);
        }
      }
      
      if (backstoryToUse.backstoryChoices) {
        setBackstoryChoices(backstoryToUse.backstoryChoices);
      } else {
        setBackstoryChoices(DEFAULT_BACKSTORY_CHOICES);
      }
      
    } else {
      setExistingBackstories([]);
      setHasExistingBackstory(false);
    }
  } catch (error) {
    console.error('Error fetching existing backstories:', error);
  }
}, [tokenId, address, firstNameOptions]);
  
  useEffect(() => {
    if (tokenId) {
      fetchNFTByTokenId();
    }
  }, [tokenId, fetchNFTByTokenId]);
  
  useEffect(() => {
    if (nftData && address) {
      fetchExistingBackstories();
    }
  }, [nftData, address, fetchExistingBackstories]);
  
  const fetchStoryElement = async (
    attributeName: string,
    elementType: StoryElementType,
    setElement: (data: StoryElement | null) => void
  ) => {
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
    }
  };
  
  const getStoryElementContext = () => {
    const contextElements: { type: string; name: string; description: string; category: string; }[] = [];
    
    const addElementIfExists = (
      details: StoryElement | null,
      type: string
    ) => {
      if (details?.attributes) {
        const textAttribute = details.attributes.find(attr => attr.trait_type === "Text");
        if (textAttribute) {
          contextElements.push({
            type,
            name: details.name,
            description: textAttribute.value,
            category: details.category || 'Unknown'
          });
        }
      }
    };
    
    addElementIfExists(bodyDetails, 'Body');
    addElementIfExists(headwearDetails, 'Headwear');
    addElementIfExists(maskDetails, 'Mask');
    addElementIfExists(expressionDetails, 'Expression');
    
    return contextElements;
  };

  const handleBackstoryChoicesChange = (choices: BackstoryChoices) => {
    setBackstoryChoices(choices);
  };
  
  const generateFirstNames = async () => {
    if (!nftData || nameGenerationAttempts >= MAX_NAME_GENERATION_ATTEMPTS) return;
    
    setLoadingNames(true);
    setNameError('');
    
    try {
      const contextElements = getStoryElementContext();
      
      if (contextElements.length === 0) {
        console.warn('No element details available for name generation');
        setFirstNameOptions(DEFAULT_FIRST_NAMES);
        setSelectedFirstName(DEFAULT_FIRST_NAMES[0]);
        return;
      }
      
      const response = await axios.post('/api/anthropic/generate-names', {
        tokenId: nftData.tokenId,
        attributes: nftData.attributes || [],
        elementDetails: contextElements
      });
      
      if (response.data.firstNames) {
        setFirstNameOptions(response.data.firstNames);
        if (response.data.firstNames.length > 0) {
          setSelectedFirstName(response.data.firstNames[0]);
        }
      }
      
      if (response.data.lastName) {
        setLastName(response.data.lastName);
      }
    } catch (error) {
      console.error('Error generating first names:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        console.error('API error response:', error.response.data);
      }
      
      setFirstNameOptions(DEFAULT_FIRST_NAMES);
      setSelectedFirstName(DEFAULT_FIRST_NAMES[0]);
    } finally {
      setLoadingNames(false);
      setNameGenerationAttempts(prevAttempts => prevAttempts + 1);
    }
  };
  
  useEffect(() => {
    if (!nftData) return;
    
    setElementLoading(true);
    
    const fetchElementIfExists = async (
      traitType: string, 
      elementType: StoryElementType, 
      setterFunction: (data: StoryElement | null) => void
    ) => {
      const attribute = nftData.attributes?.find(attr => attr.trait_type === traitType)?.value;
      if (attribute) {
        await fetchStoryElement(String(attribute), elementType, setterFunction);
      } else {
        if (REQUIRED_ATTRIBUTES.includes(traitType as typeof REQUIRED_ATTRIBUTES[number])) {
          console.warn(`Required attribute ${traitType} not found in metadata`);
        } else {
          console.log(`Optional attribute ${traitType} not present in metadata`);
        }
        setterFunction(null);
      }
    };
    
    const fetchAllElements = async () => {
      try {
        await Promise.all([
          fetchElementIfExists('Body', 'body', setBodyDetails),
          fetchElementIfExists('Headwear', 'headwear', setHeadwearDetails),
          fetchElementIfExists('Mask', 'mask', setMaskDetails),
          fetchElementIfExists('Expression', 'expression', setExpressionDetails)
        ]);
        
        const maskAttribute = nftData.attributes?.find(attr => attr.trait_type === "Mask");
        if (maskAttribute) {
          setLastName(String(maskAttribute.value));
        } else {
          setLastName('Unknown');
        }
        
        setNameGenerationAttempts(0);
      } finally {
        setElementLoading(false);
      }
    };
    
    fetchAllElements();
  }, [nftData]);
  
  const generateBackstory = async () => {
    if (!nftData) return;
    
    if (!selectedFirstName) {
      alert("Please select a first name for your character.");
      return;
    }
    
    setGenerating(true);
    setNameError('');
    setAnimationNotes(null);
    
    try {
      const contextElements = getStoryElementContext();
      
      const requestBody = {
        tokenId: nftData.tokenId,
        name: `${selectedFirstName} ${lastName}`,
        nftTitle: nftData.name || `Los Muertos #${nftData.tokenId}`,
        attributes: nftData.attributes || [],
        elementDetails: contextElements,
        walletAddress: address,
        characterName: {
          firstName: selectedFirstName,
          lastName: lastName
        },
        backstoryChoices: backstoryChoices,
        forceRegenerate: true
      };
      
      const response = await axios.post('/api/anthropic/backstory', requestBody);
      
      if (response.data.backstory) {
        setBackstory(response.data.backstory);
        
        if (response.data.shortId) {
          setBackstoryShortId(response.data.shortId);
        }
        
        if (response.data.animationNotes) {
          setAnimationNotes(response.data.animationNotes);
          setShowAnimationNotes(true);
        }

        if (response.data.backstoryChoices) {
          setBackstoryChoices(response.data.backstoryChoices);
        }
        
        fetchExistingBackstories();
      } else {
        console.error('No backstory in response:', response.data);
        setBackstory('Failed to generate backstory. Please try again.');
      }
    } catch (error) {
      console.error('Error generating backstory:', error);
      
      let errorMessage = 'An error occurred while generating the backstory. Please try again.';
      
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
        if (errorMessage.includes('name combination is already in use')) {
          setNameError(errorMessage);
        }
      }

      setBackstory(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyBackstory = () => {
    if (backstory) {
      navigator.clipboard.writeText(backstory);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const showTooltip = (elementType: string) => {
    setActiveTooltip(elementType);
  };

  const hideTooltip = () => {
    setActiveTooltip(null);
  };

  const toggleAnimationNotes = () => {
    setShowAnimationNotes(!showAnimationNotes);
  };

  const renderWalletNotConnected = () => (
    <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
      <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
      <p>Connect your wallet to create a backstory for your Muerto</p>
    </div>
  );

  const renderLoading = () => (
    <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Loading your Muerto...</p>
      </div>
    </div>
  );

  const renderNFTNotFound = () => (
    <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md mx-auto mb-6 mt-2 text-center">
          <p className="text-2xl font-bold text-white mb-2">Muerto Not Found</p>
          <p className="text-lg text-gray-400">Please check the token ID</p>
        </div>        
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Link
            href="/losmuertosworld"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <span className="mr-2">Back to Los Muertos World</span>
          </Link>
          
          <button 
            onClick={fetchNFTByTokenId} 
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );

  const renderCharacterNameSection = () => (
    <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
      <h4 className="text-lg font-medium mb-3 text-purple-300">Character Name</h4>

      <div className="space-y-4">
        
        <div className="mt-4">
          <button
            onClick={generateFirstNames}
            disabled={loadingNames || 
                    nameGenerationAttempts >= MAX_NAME_GENERATION_ATTEMPTS || 
                    (existingBackstories.length > 0) || 
                    generating}
            className={`px-4 py-2 rounded transition-colors ${
              nameGenerationAttempts >= MAX_NAME_GENERATION_ATTEMPTS 
              || (existingBackstories.length > 0)
              || generating
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : loadingNames
                  ? 'bg-blue-600 opacity-70 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loadingNames ? (
              <>
                <RefreshCw className="inline-block mr-2 h-4 w-4 animate-spin" />
                Generating name ideas...
              </>
            ) : nameGenerationAttempts >= MAX_NAME_GENERATION_ATTEMPTS 
            || (existingBackstories.length > 0) ? (
              'Name already set'
            ) : generating ? (
              'Generating backstory...'
            ) : (
              `Generate Name Ideas (${nameGenerationAttempts}/${MAX_NAME_GENERATION_ATTEMPTS})`
            )}
          </button>
        </div>

        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
            First Name
          </label>
          {loadingNames ? (
            <div className="h-10 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <select
              id="firstName"
              value={selectedFirstName}
              onChange={(e) => setSelectedFirstName(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="">Select a first name</option>
              {firstNameOptions.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
            Last Name (Based on Mask)
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            disabled
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white opacity-75 cursor-not-allowed"
          />
        </div>

        <div className="pt-2">
          <p className="text-sm text-gray-400">
            Full Character Name: <span className="text-white font-medium">{selectedFirstName ? `${selectedFirstName} ${lastName}` : `${lastName} (select a first name)`}</span>
          </p>
          
          {nameError && (
            <p className="text-xs text-red-400 mt-1">
              {nameError}
            </p>
          )}
          
          {!selectedFirstName && !loadingNames && firstNameOptions.length > 0 && (
            <p className="text-xs text-amber-400 mt-1">
              Please select a first name before generating the backstory.
            </p>
          )}
          
          {nameGenerationAttempts >= MAX_NAME_GENERATION_ATTEMPTS && (
            <p className="text-xs text-amber-400 mt-2">
              You&apos;ve reached the maximum number of name generation attempts.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStoryElements = () => {
    if (elementLoading) {
      return (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      );
    }

    const elements = [
      { type: 'Body', details: bodyDetails },
      { type: 'Headwear', details: headwearDetails },
      { type: 'Mask', details: maskDetails },
      { type: 'Expression', details: expressionDetails }
    ].filter(el => el.details);

    if (elements.length === 0) return null;

    return (
      <div className="p-3 bg-gray-800 rounded-lg">
        <h4 className="font-medium text-purple-400 mb-2">Character Traits</h4>
        <div className="flex flex-wrap gap-2">
          {elements.map(element => {
            if (!element.details) return null;
            
            const description = element.details.attributes.find(attr => attr.trait_type === "Text")?.value || "No description available";
            
            return (
              <div key={element.type} className="relative">
                <div 
                  className="inline-flex items-center px-2 py-1 bg-gray-700 rounded-md text-sm cursor-help"
                  onMouseEnter={() => showTooltip(element.type)}
                  onMouseLeave={hideTooltip}
                >
                  <span>{element.type}: {element.details.name}</span>
                  <Info className="inline-block ml-1 h-3 w-3 text-gray-400" />
                </div>
                
                {activeTooltip === element.type && (
                  <div className="absolute z-10 mt-1 w-64 p-2 bg-gray-900 border border-gray-700 rounded shadow-lg text-sm">
                    {description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAnimationNotes = () => {
    if (!animationNotes) return null;

    return (
      <div className="mt-6 bg-gray-800/50 rounded-lg overflow-hidden">
        <button 
          onClick={toggleAnimationNotes}
          className="w-full flex justify-between items-center p-4 text-left bg-gradient-to-r from-purple-700/70 to-violet-700/70 hover:from-purple-600 hover:to-violet-600 transition-colors"
        >
          <span className="text-white font-medium flex items-center">
            <Play className="mr-2 h-4 w-4" />
            Animation Notes
          </span>
          {showAnimationNotes ? 
            <ChevronUp className="h-5 w-5 text-white" /> : 
            <ChevronDown className="h-5 w-5 text-white" />
          }
        </button>
        
        {showAnimationNotes && (
          <div className="p-4 space-y-4 bg-black/20">
            {/* Handle raw notes if parsing failed */}
            {animationNotes.parsingFailed && animationNotes.rawNotes && (
              <div className="space-y-2">
                {animationNotes.rawNotes.map((note, index) => (
                  <p key={index} className="text-gray-300 text-sm">
                    {note}
                  </p>
                ))}
              </div>
            )}
            
            {/* Otherwise display structured notes */}
            {!animationNotes.parsingFailed && (
              <>
                {/* Visual Quirks */}
                {animationNotes.visualQuirks && animationNotes.visualQuirks.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="flex items-center font-medium text-purple-300">
                      <Zap className="mr-2 h-4 w-4" />
                      Visual Quirks
                    </h5>
                    <ul className="space-y-1 pl-6 list-disc">
                      {animationNotes.visualQuirks.map((quirk, index) => (
                        <li key={index} className="text-gray-300 text-sm">
                          {quirk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Voice Patterns */}
                {animationNotes.voicePatterns && animationNotes.voicePatterns.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="flex items-center font-medium text-purple-300">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Voice & Dialogue
                    </h5>
                    <ul className="space-y-1 pl-6 list-disc">
                      {animationNotes.voicePatterns.map((pattern, index) => (
                        <li key={index} className="text-gray-300 text-sm">
                          {pattern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Relationship Dynamics */}
                {animationNotes.relationshipDynamics && animationNotes.relationshipDynamics.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="flex items-center font-medium text-purple-300">
                      <Users className="mr-2 h-4 w-4" />
                      Relationship Dynamics
                    </h5>
                    <ul className="space-y-1 pl-6 list-disc">
                      {animationNotes.relationshipDynamics.map((dynamic, index) => (
                        <li key={index} className="text-gray-300 text-sm">
                          {dynamic}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Episodic Potential */}
                {animationNotes.episodicPotential && animationNotes.episodicPotential.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="flex items-center font-medium text-purple-300">
                      <Play className="mr-2 h-4 w-4" />
                      Episodic Potential
                    </h5>
                    <ul className="space-y-1 pl-6 list-disc">
                      {animationNotes.episodicPotential.map((potential, index) => (
                        <li key={index} className="text-gray-300 text-sm">
                          {potential}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            
            {/* Add a badge if notes were generated separately */}
            {animationNotes.generatedSeparately && (
              <div className="mt-2 text-xs text-gray-400 italic">
                These animation notes were generated based on the character backstory.
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderBackstoryContent = () => (
    <div className="min-h-64 max-h-96 bg-white/90 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg p-4 overflow-y-auto">
      {backstory ? (
        <div className="max-w-none">
          {backstory.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-900 dark:text-white">
              {paragraph}
            </p>
          ))}
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          <p>
            {elementLoading 
              ? "Loading Muerto traits..."
              : generating 
                ? "Crafting your Muerto's backstory..."
                : "Click 'Generate Backstory' to create a unique story for your Muerto."
            }
          </p>
        </div>
      )}
    </div>
  );

  const renderBackstoryActions = () => {
    if (!backstory) return null;
  
    return (
      <>
        <div className="mt-3 mb-2 flex items-center">
          <div className="flex-1 text-xs italic text-gray-500 dark:text-gray-400 flex items-center">
            <Info className="h-3 w-3 mr-1 opacity-70" />
            Note: Muerto Storytime is in Beta. Backstories are subject to being archived while we refine story quality.
          </div>
        </div>
  
        <div className="mt-2 flex gap-3 justify-end">
          {/* Share Button - Show if backstory exists */}
          {backstory && (
            <BackstoryShareButton
              muertosId={parseInt(tokenId || "0", 10)}
              characterName={`${selectedFirstName || ""} ${lastName || ""}`}
              backstory={backstory}
              shortId={backstoryShortId}
              walletAddress={address || "unknown"}
              className="bg-blue-600 text-white hover:bg-blue-700"
            />
          )}
          <button
            onClick={handleCopyBackstory}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                      bg-white text-gray-700 border border-gray-300 shadow-sm
                      dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600
                      hover:bg-gray-100 dark:hover:bg-gray-600 transition-all 
                      hover:shadow-md"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
        </div>
        {backstory && (
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={`/losmuertosworld/character-storyelement?tokenId=${tokenId}`}
              className="w-full inline-flex items-center justify-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Create a Story Element
            </Link>
          </div>
        )}
      </>
    );
  };

  if (!isConnected) {
    return renderWalletNotConnected();
  }

  if (loading) {
    return renderLoading();
  }

  if (!nftData) {
    return renderNFTNotFound();
  }

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left Column - NFT Info */}
      <div className="lg:col-span-2 bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">{nftData.name || `Los Muertos #${nftData.tokenId}`}</h3>

        <div className="relative aspect-square rounded-lg overflow-hidden mb-6">
          {nftData.image ? (
            <Image
              src={nftData.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
              alt={nftData.name || `Muerto #${nftData.tokenId}`}
              fill
              sizes="(max-width: 450px) 100vw, 50vw"
              className="object-contain"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400">No Image Available</span>
            </div>
          )}
        </div>

        {renderCharacterNameSection()}
        {renderStoryElements()}
      </div>

      {/* Right Column - Backstory */}
      <div className="lg:col-span-3 backstory-container rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center backstory-text">
              <BookOpen className="mr-2 h-5 w-5" />
              Muerto Backstory
            </h3>
            {/* Add Backstory Selector Component */}
            <div className="mb-6">
              <BackstorySelector 
                onChoicesChange={handleBackstoryChoicesChange} 
                initialChoices={backstoryChoices}
                disabled={generating || elementLoading}
              />
            </div>
            <p className="text-sm text-purple-400 mt-1 italic">Narrative Context: The Violet Reaches</p>
          </div>
          
          <button
            onClick={generateBackstory}
            disabled={generating || elementLoading || !selectedFirstName}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-700 text-white font-medium
                      rounded-lg shadow-lg shadow-purple-500/20 dark:shadow-purple-700/20
                      hover:from-purple-700 hover:to-violet-800 
                      transform transition-all duration-200 hover:scale-105
                      disabled:opacity-50 disabled:cursor-not-allowed 
                      disabled:hover:scale-100 flex items-center"
          >
            {generating ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : hasExistingBackstory ? (
              <>
                <BookOpen className="mr-2 h-5 w-5" />
                Generate New Backstory
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-5 w-5" />
                Generate Backstory
              </>
            )}
          </button>
        </div>
        <div className="relative">
          {renderBackstoryContent()}
          {renderBackstoryActions()}
        </div>
              
        {/* Animation Notes Section */}
        {renderAnimationNotes()}
      </div>

      {/* Backstory History */}
      <div className="lg:col-span-5">
        {nftData && <BackstoryHistory tokenId={nftData.tokenId} />}
      </div>
    </div>
  );
}