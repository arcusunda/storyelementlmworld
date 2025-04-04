// app/losmuertosworld/refinedstoryelements/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import Image from 'next/image'
import axios from 'axios'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { BookOpen, RefreshCw, Clock, User, Filter, Info, ArrowUpDown } from 'lucide-react'

import dynamic from 'next/dynamic'
const ConnectButton = dynamic(() => import('../../components/ConnectButton'), {
  ssr: false
})

interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

interface ElementRelationship {
  relatedElementName: string;
  relationType: string;
}

interface IpRegistrationPotential {
  uniqueness: number;
  worldBuilding: number;
  commercialPotential: number;
  recommendedForRegistration: boolean;
}

interface StoryElement {
  id: string;
  tokenId: string;
  shortId: string;
  nftTitle: string;
  elementTitle: string;
  elementType: string;
  description: string;
  culturalInfluences: string[];
  narrativePotential: string;
  relationships: ElementRelationship[];
  walletAddress: string;
  ipRegistrationPotential: IpRegistrationPotential;
  refinementStage: string;
  createdAt: string;
  updatedAt: string;
  registeredAsIp: boolean;
  registrationDate: string | null;
  registrationTxHash: string | null;
  
  refinedAt: string | null;
  summaryCreatedAt: string | null;
  structureRefinedAt: string | null;
  uniquenessDeterminedAt: string | null;
  narrativePotentialAssessedAt: string | null;
  relationshipsIdentifiedAt: string | null;
  ipAssessedAt: string | null;
  worldbuildingAssessedAt: string | null;
}

interface MuertoNFT {
  tokenId: string;
  name?: string;
  image?: string;
  attributes?: NFTAttribute[];
}

interface IpaMetadata {
  _id: string;
  title: string;
  ipType?: string;
  tokenId?: string;
  image?: string;
  sourceId: string;
}

const REFINEMENT_STAGES = [
  'unrefined',
  'animation_notes_added',
  'summary_created',
  'structure_refined',
  'uniqueness_determined',
  'narrative_potential_assessed',
  'relationships_identified',
  'ip_assessed',
  'ipa_ready'
];

const formatStageName = (stage: string): string => {
  return stage
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function StoryElementsPage() {
  const { isConnected, address } = useAppKitAccount()
  const [storyElements, setStoryElements] = useState<StoryElement[]>([])
  const [nfts, setNfts] = useState<Record<string, MuertoNFT>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'mine'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [mounted, setMounted] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [ipaMetadata, setIpaMetadata] = useState<Record<string, IpaMetadata>>({})

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const fetchStoryElements = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams();
      
      if (filter === 'mine' && address) {
        queryParams.append('wallet', address);
      }
      
      if (typeFilter !== 'all') {
        queryParams.append('elementType', typeFilter);
      }
      
      if (stageFilter !== 'all') {
        if (stageFilter === 'complete') {
          queryParams.append('minStage', 'relationships_identified');
        } else if (stageFilter === 'display') {
          queryParams.append('minStage', 'narrative_potential_assessed');
        } else {
          queryParams.append('stage', stageFilter);
        }
      }
      
      const queryString = queryParams.toString();
      const response = await axios.get<{ storyElements: StoryElement[] }>(
        `/api/refinedstoryelements${queryString ? `?${queryString}` : ''}`
      );
      
      if (response.data.storyElements) {
        setStoryElements(response.data.storyElements)
        
        const tokenIds: string[] = [...new Set(response.data.storyElements.map((item: StoryElement) => item.tokenId))]
        await fetchNFTMetadata(tokenIds)

        await fetchIpaMetadata(response.data.storyElements)
      }

    } catch (error) {
      console.error('Error fetching story elements:', error)
    } finally {
      setLoading(false)
    }
  }, [address, filter, typeFilter, stageFilter])
  
  const fetchNFTMetadata = async (tokenIds: string[]) => {
    const nftData: Record<string, MuertoNFT> = {}
    
    try {
      for (const tokenId of tokenIds) {
        try {
          const response = await axios.get(`/api/alchemy/fetchnft?tokenId=${tokenId}`)
          if (response.data.nft) {
            nftData[tokenId] = response.data.nft
          }
        } catch (err) {
          console.error(`Error fetching NFT metadata for token ${tokenId}:`, err)
        }
      }
      
      setNfts(nftData)
    } catch (error) {
      console.error('Error fetching NFT metadata:', error)
    }
  }
  
  const fetchIpaMetadata = async (elements: StoryElement[]) => {
    const ipaData: Record<string, IpaMetadata> = {}
    
    try {
      const shortIds = [...new Set(elements.map(elem => elem.shortId))]
      
      for (const shortId of shortIds) {
        try {
          const response = await axios.get(`/api/ipametadata/fetchBySourceId?sourceId=${shortId}`)
          if (response.data.ipametadata) {
            ipaData[shortId] = response.data.ipametadata
          }
        } catch {
          console.log(`No IPA metadata found for sourceId ${shortId}`)
        }
      }
      
      setIpaMetadata(ipaData)
    } catch (error) {
      console.error('Error fetching IPA metadata:', error)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchStoryElements()
    }
  }, [mounted, fetchStoryElements])
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const truncateAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getElementTypeColor = (elementType: string) => {
    const typeColors: Record<string, string> = {
      'Artifact': 'bg-purple-500',
      'Location': 'bg-blue-500',
      'Organization': 'bg-green-500',
      'Ritual': 'bg-amber-500',
      'Event': 'bg-red-500',
      'System': 'bg-teal-500',
      'Character': 'bg-pink-500',
      'Faction': 'bg-indigo-500'
    }
    
    return typeColors[elementType] || 'bg-gray-500'
  }
  
  const getRefinementStageColor = (stage: string) => {
    const stageColors: Record<string, string> = {
      'unrefined': 'bg-gray-500',
      'animation_notes_added': 'bg-blue-500',
      'summary_created': 'bg-green-500',
      'structure_refined': 'bg-yellow-500',
      'uniqueness_determined': 'bg-purple-500',
      'narrative_potential_assessed': 'bg-pink-500',
      'relationships_identified': 'bg-indigo-500',
      'ip_assessed': 'bg-orange-500',
      'ipa_ready': 'bg-teal-500'
    }
    
    return stageColors[stage] || 'bg-gray-500'
  }
  
  const getStageProgress = (stage: string): number => {
    const stageIndex = REFINEMENT_STAGES.indexOf(stage);
    if (stageIndex === -1) return 0;
    
    return Math.round((stageIndex / (REFINEMENT_STAGES.length - 1)) * 100);
  }
  
  const renderIpPotentialBadge = (potential: IpRegistrationPotential) => {
    if (!potential) return null
    
    const totalScore = potential.uniqueness + potential.worldBuilding + potential.commercialPotential
    const avgScore = Math.round(totalScore / 3)
    
    let badgeColor = 'bg-gray-600'
    if (avgScore >= 8) badgeColor = 'bg-green-600'
    else if (avgScore >= 6) badgeColor = 'bg-amber-600'
    else if (avgScore >= 4) badgeColor = 'bg-orange-600'
    
    return (
      <div className={`text-xs font-medium ${badgeColor} text-white rounded-full px-2 py-0.5 flex items-center`}>
        <span>IP Score: {avgScore}/10</span>
      </div>
    )
  }
  
  const renderRefiningIndicator = (element: StoryElement) => {
    const completedStages = [
      'relationships_identified',
      'ip_assessed',
      'ipa_ready'
    ];
    
    if (completedStages.includes(element.refinementStage)) {
      return null;
    }
    
    const progress = getStageProgress(element.refinementStage);
    
    return (
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Refinement Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-gray-400 italic">
          Current Stage: {formatStageName(element.refinementStage)}
        </div>
      </div>
    );
  }

  const renderRefinementInfoModal = () => {
    if (!showInfoModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Story Element Refinement Process</h2>
            <button 
              onClick={() => setShowInfoModal(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-300">
              Story elements go through a multi-stage refinement process using AI to enhance quality, 
              analyze narrative potential, and prepare them for potential IP registration.
            </p>
            
            <h3 className="text-lg font-medium text-white mt-2">Refinement Stages:</h3>
            
            <div className="space-y-3">
              {REFINEMENT_STAGES.map((stage) => (
                <div key={stage} className="flex items-start">
                  <div className={`w-3 h-3 rounded-full ${getRefinementStageColor(stage)} mt-1.5 mr-3 flex-shrink-0`} />
                  <div>
                    <div className="font-medium text-white">{formatStageName(stage)}</div>
                    <div className="text-sm text-gray-400">
                      {stage === 'unrefined' && "Initial creation of story element by the user."}
                      {stage === 'animation_notes_added' && "Enhanced with specific animation-related details and characteristics."}
                      {stage === 'summary_created' && "Concise summary generated for quick reference and search."}
                      {stage === 'structure_refined' && "Structured with metadata like element type, title, and cultural influences."}
                      {stage === 'uniqueness_determined' && "Analyzed for uniqueness compared to other elements in the universe."}
                      {stage === 'narrative_potential_assessed' && "Evaluated for storytelling potential and thematic resonance."}
                      {stage === 'relationships_identified' && "Connections to other story elements and backstories established."}
                      {stage === 'ip_assessed' && "Evaluated for commercial and IP registration potential."}
                      {stage === 'ipa_ready' && "Transformed into Story Network metadata."}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-3 bg-gray-700/50 rounded-lg mt-3">
              <h4 className="font-medium text-white mb-1">Filtering Options:</h4>
              <ul className="text-sm text-gray-300 space-y-1 list-disc pl-5">
                <li><span className="text-white">Display Ready</span>: Elements refined enough to be clearly presented (narrative_potential_assessed or later).</li>
                <li><span className="text-white">Complete</span>: Elements that have completed all major refinement stages (relationships_identified or later).</li>
                <li><span className="text-white">In Progress</span>: Elements currently being refined at various stages.</li>
              </ul>
            </div>
            
            <button 
              onClick={() => setShowInfoModal(false)}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
            <div className="bg-gray-800 rounded-xl p-6 h-32 w-full" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p>Loading story elements...</p>
          </div>
        </div>
      )
    }

    if (storyElements.length === 0) {
      return (
        <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
          <div className="flex flex-col items-center">
            {/* SVG Placeholder */}
            <div className="w-full max-w-md mx-auto mb-6 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500">
                <defs>
                  <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1a1a2e" />
                    <stop offset="100%" stopColor="#16213e" />
                  </linearGradient>
                  <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#7209b7" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#7209b7" stopOpacity="0" />
                  </radialGradient>
                </defs>
                
                {/* Main background */}
                <rect width="600" height="500" fill="url(#bgGradient)" rx="15" ry="15" />
                
                {/* Decorative elements */}
                <circle cx="300" cy="250" r="180" fill="url(#glow)" />
                
                {/* Book illustration */}
                <g transform="translate(300, 220) scale(1.2)">
                  {/* Book */}
                  <path d="M-70,-30 L70,-30 L70,50 L-70,50 Z" fill="#4361ee" stroke="#f1f1f1" strokeWidth="2" />
                  <path d="M-70,-30 L0,-50 L70,-30" fill="none" stroke="#f1f1f1" strokeWidth="2" />
                  <line x1="-50" y1="-10" x2="50" y2="-10" stroke="#f1f1f1" strokeWidth="2" strokeDasharray="5,3" />
                  <line x1="-50" y1="10" x2="50" y2="10" stroke="#f1f1f1" strokeWidth="2" strokeDasharray="5,3" />
                  <line x1="-50" y1="30" x2="50" y2="30" stroke="#f1f1f1" strokeWidth="2" strokeDasharray="5,3" />
                  
                  {/* Mask decoration */}
                  <circle cx="0" cy="-30" r="15" fill="#f1f1f1" />
                  <circle cx="-5" cy="-35" r="3" fill="#4361ee" />
                  <circle cx="5" cy="-35" r="3" fill="#4361ee" />
                  <path d="M-5,-25 C-2,-22 2,-22 5,-25" stroke="#4361ee" strokeWidth="2" fill="none" />
                </g>
                
                {/* Text */}
                <text x="300" y="350" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="bold" fill="#ffffff" textAnchor="middle">No Story Elements Found</text>
                <text x="300" y="385" fontFamily="Arial, sans-serif" fontSize="18" fill="#b8c0c8" textAnchor="middle">
                  {filter === 'mine' 
                    ? 'Create elements from your backstories!' 
                    : stageFilter !== 'all' 
                      ? `No elements at "${formatStageName(stageFilter)}" stage` 
                      : 'No story elements have been created yet.'}
                </text>
              </svg>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link
                href="/losmuertosworld/backstories"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                <span>Explore Backstories</span>
              </Link>
            </div>
            
            <button 
              onClick={fetchStoryElements} 
              className="mt-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storyElements.map((element) => {
          const nft = nfts[element.tokenId]
          const isCompletelyRefined = element.refinementStage === 'relationships_identified' ||
                                    element.refinementStage === 'ip_assessed' ||
                                    element.refinementStage === 'ipa_ready';

          const ipa = ipaMetadata[element.shortId]
          const imageUrl = ipa?.image 
            ? ipa.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
            : nft?.image
              ? nft.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
              : null;                                    
          
          return (
            <div 
              key={element.id} 
              className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] border border-gray-700 bg-gray-800/50"
            >
              {/* NFT Image */}
              <div className="relative w-full pt-[80%]">
                <Link href={`/losmuertosworld/refinedstoryelements/s/${element.shortId}`}>
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={element.elementTitle || element.nftTitle}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain absolute inset-0 cursor-pointer"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400">Image Loading...</span>
                  </div>
                )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                    <div className="w-full p-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <div className={`text-xs font-medium ${getElementTypeColor(element.elementType)} text-white rounded-full px-2 py-0.5`}>
                          {element.elementType}
                        </div>
                        
                        {!isCompletelyRefined && (
                          <div className={`text-xs font-medium ${getRefinementStageColor(element.refinementStage)} text-white rounded-full px-2 py-0.5`}>
                            {formatStageName(element.refinementStage)}
                          </div>
                        )}
                        
                        {element.registeredAsIp && (
                          <div className="text-xs font-medium bg-yellow-600 text-white rounded-full px-2 py-0.5 flex items-center">
                            <span>Registered IP</span>
                          </div>
                        )}
                        {renderIpPotentialBadge(element.ipRegistrationPotential)}
                      </div>
                      <h3 className="text-white font-bold text-lg leading-tight">{element.elementTitle}</h3>
                      <p className="text-gray-300 text-sm">{element.nftTitle}</p>
                    </div>
                  </div>
                </Link>
              </div>
              
              <div className="p-5">
                {/* Element preview */}
                <div className="mb-4">
                  <h4 className="font-medium text-lg mb-2">Description</h4>
                  <p className="text-sm text-gray-300 line-clamp-3">
                    {element.description.split('\n')[0]}...
                  </p>
                </div>
                
                {/* Cultural Influences */}
                {element.culturalInfluences && element.culturalInfluences.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs text-gray-400 mb-1">Cultural Influences</h4>
                    <div className="flex flex-wrap gap-1">
                      {element.culturalInfluences.slice(0, 3).map((culture, index) => (
                        <span key={index} className="text-xs bg-gray-700 text-gray-300 rounded px-2 py-0.5">{culture}</span>
                      ))}
                      {element.culturalInfluences.length > 3 && (
                        <span className="text-xs bg-gray-700 text-gray-300 rounded px-2 py-0.5">+{element.culturalInfluences.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Refinement Progress Indicator */}
                {renderRefiningIndicator(element)}
                
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2 mb-4 mt-4">
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{formatDate(element.createdAt)}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <User className="h-3.5 w-3.5 mr-1" />
                    <span>{truncateAddress(element.walletAddress)}</span>
                  </div>
                </div>
                
                {/* Action button */}
                <Link
                  href={`/losmuertosworld/refinedstoryelements/s/${element.shortId}`}
                  className="w-full inline-flex items-center justify-center py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Full Element
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-8 bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold mb-4 md:mb-0 text-white">Story Elements</h1>
              <button 
                onClick={() => setShowInfoModal(true)}
                className="p-1 ml-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50 transition-colors"
                title="Learn About Refinement Stages"
              >
                <Info className="h-5 w-5" />
              </button>
            </div>
            <ConnectButton />
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">

            <p className="text-gray-300">
            Explore the settings, artifacts, and other phenomena within
              <span className="text-purple-400 italic font-medium"> The Violet Reaches </span>
              narrative context.
            </p>


            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex bg-gray-700 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setFilter('all')} 
                  className={`px-4 py-2 text-sm ${filter === 'all' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                >
                  All Elements
                </button>
                <button 
                  onClick={() => {
                    if (isConnected) {
                      setFilter('mine')
                    } else {
                      alert('Please connect your wallet to view your elements')
                    }
                  }} 
                  className={`px-4 py-2 text-sm ${filter === 'mine' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                >
                  My Elements
                </button>
              </div>
              
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none bg-gray-700 text-gray-300 px-4 py-2 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Types</option>
                  <option value="Artifact">Artifacts</option>
                  <option value="Location">Locations</option>
                  <option value="Organization">Organizations</option>
                  <option value="Ritual">Rituals</option>
                  <option value="Event">Events</option>
                  <option value="System">Systems</option>
                  <option value="Character">Characters</option>
                  <option value="Faction">Factions</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <Filter className="h-4 w-4" />
                </div>
              </div>
              
              <div className="relative">
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="appearance-none bg-gray-700 text-gray-300 px-4 py-2 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Stages</option>
                  <option value="display">Display Ready</option>
                  <option value="complete">Complete</option>
                  <option value="unrefined">Unrefined</option>
                  <option value="animation_notes_added">Animation Notes</option>
                  <option value="summary_created">Summarized</option>
                  <option value="structure_refined">Structured</option>
                  <option value="uniqueness_determined">Uniqueness Assessed</option>
                  <option value="narrative_potential_assessed">Narrative Assessed</option>
                  <option value="relationships_identified">Relationships Identified</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {renderContent()}
        {renderRefinementInfoModal()}
        
        <div className="mt-8 flex justify-center">
          <Link
            href="/losmuertosworld/backstories"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            <span>Explore Backstories</span>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}