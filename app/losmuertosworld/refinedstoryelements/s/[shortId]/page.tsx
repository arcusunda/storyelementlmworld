// /app/losmuertosworld/refinedstoryelements/s/[shortId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import axios from 'axios'
import Link from 'next/link'
import { ArrowLeft, Clock, User, ChevronDown, ChevronUp, Link as LinkIcon, Award, Zap, Users, Play, MessageSquare } from 'lucide-react'
import Header from '../../../../components/Header'
import Footer from '../../../../components/Footer'

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

interface AnimationNotes {
  visualQuirks?: string[];
  voicePatterns?: string[];
  relationshipDynamics?: string[];
  episodicPotential?: string[];
  rawNotes?: string[];
  parsingFailed?: boolean;
  generatedSeparately?: boolean;
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
  animationNotes?: AnimationNotes;
  createdAt: string;
  registeredAsIp: boolean;
  registrationDate: string | null;
  registrationTxHash: string | null;
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

export default function StoryElementDetailPage() {
  const params = useParams()
  const shortId = Array.isArray(params?.shortId) ? params.shortId[0] : params?.shortId || ''
  
  const [storyElement, setStoryElement] = useState<StoryElement | null>(null)
  const [nft, setNft] = useState<MuertoNFT | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAnimationNotes, setShowAnimationNotes] = useState(true)
  const [showIpPotential, setShowIpPotential] = useState(true)
  const [ipaMetadata, setIpaMetadata] = useState<IpaMetadata | null>(null)
  
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  
  useEffect(() => {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(isDarkMode ? 'dark' : 'light')
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light')
    }
    
    mediaQuery.addEventListener('change', handleThemeChange)
    return () => mediaQuery.removeEventListener('change', handleThemeChange)
  }, [])
  
  useEffect(() => {
    const fetchElementDetails = async () => {
      if (!shortId) return
      
      setLoading(true)
      try {
        const elementResponse = await axios.get(`/api/refinedstoryelements?shortId=${shortId}`)
        
        if (elementResponse.data.storyElements && elementResponse.data.storyElements.length > 0) {
          const foundElement = elementResponse.data.storyElements[0]
          setStoryElement(foundElement)
          
          const nftResponse = await axios.get(`/api/alchemy/fetchnft?tokenId=${foundElement.tokenId}`)
          if (nftResponse.data.nft) {
            setNft(nftResponse.data.nft)
          }
          
          try {
            const ipaResponse = await axios.get(`/api/ipametadata/fetchBySourceId?sourceId=${shortId}`)
            if (ipaResponse.data.ipametadata) {
              setIpaMetadata(ipaResponse.data.ipametadata)
            }
          } catch {
            console.log(`No IPA metadata found for sourceId ${shortId}`)
          }
        } else {
          console.error('Story element not found with shortId:', shortId)
        }
      } catch (error) {
        console.error('Error fetching story element details:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchElementDetails()
  }, [shortId])
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const truncateAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const toggleIpPotential = () => {
    setShowIpPotential(!showIpPotential)
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

  const renderCulturalInfluences = () => {
    if (!storyElement?.culturalInfluences || storyElement.culturalInfluences.length === 0) return null

    return (
      <div className="mt-6">
        <h3 className={`text-md font-medium mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
          Cultural Influences
        </h3>
        <div className="flex flex-wrap gap-2">
          {storyElement.culturalInfluences.map((culture, index) => (
            <span 
              key={index} 
              className={`${theme === 'light' ? 'bg-gray-200 text-gray-800' : 'bg-gray-700 text-gray-300'} px-3 py-1 rounded-full text-sm`}
            >
              {culture}
            </span>
          ))}
        </div>
      </div>
    )
  }

  const renderRelationships = () => {
    if (!storyElement?.relationships || storyElement.relationships.length === 0) return null

    return (
      <div className="mt-6">
        <h3 className={`text-md font-medium mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
          Relationships Connections to Other Elements
        </h3>
        <div className={`${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800/50'} rounded-lg p-4`}>
          <ul className="space-y-2">
            {storyElement.relationships.map((relationship, index) => (
              <li key={index} className="flex items-start">
                <LinkIcon className={`h-4 w-4 mr-2 mt-1 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                <div>
                  <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                    {relationship.relatedElementName}
                  </span>
                  <span className={`ml-2 text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                    ({relationship.relationType})
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  const renderIpPotential = () => {
    if (!storyElement?.ipRegistrationPotential) return null

    const potential = storyElement.ipRegistrationPotential;

    return (
      <div className="mt-6">
        <button 
          onClick={toggleIpPotential}
          className="w-full flex justify-between items-center p-4 text-left bg-gradient-to-r from-yellow-700/70 to-amber-700/70 hover:from-yellow-600 hover:to-amber-600 transition-colors rounded-t-lg"
        >
          <span className="text-white font-medium flex items-center">
            <Award className="mr-2 h-4 w-4" />
            IP Registration Potential
          </span>
          {showIpPotential ? 
            <ChevronUp className="h-5 w-5 text-white" /> : 
            <ChevronDown className="h-5 w-5 text-white" />
          }
        </button>
        
        {showIpPotential && (
          <div className={`p-4 space-y-4 ${theme === 'light' ? 'bg-amber-50' : 'bg-black/20'} rounded-b-lg border-t border-amber-700/30`}>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-lg font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                  {potential.uniqueness}/10
                </div>
                <div className="text-sm text-gray-500">Uniqueness</div>
                <div className="mt-2 h-2 bg-gray-300 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-500" 
                    style={{ width: `${potential.uniqueness * 10}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                  {potential.worldBuilding}/10
                </div>
                <div className="text-sm text-gray-500">World Building</div>
                <div className="mt-2 h-2 bg-gray-300 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                    style={{ width: `${potential.worldBuilding * 10}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                  {potential.commercialPotential}/10
                </div>
                <div className="text-sm text-gray-500">Commercial</div>
                <div className="mt-2 h-2 bg-gray-300 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500" 
                    style={{ width: `${potential.commercialPotential * 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-4">
              {potential.recommendedForRegistration ? (
                <div className="bg-green-600 text-white px-4 py-2 rounded-full text-sm flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Recommended for IP Registration
                </div>
              ) : (
                <div className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Not Recommended for IP Registration
                </div>
              )}
            </div>
            
            {storyElement.registeredAsIp && (
              <div className="mt-4 p-3 bg-yellow-700/20 border border-yellow-700/30 rounded-lg">
                <div className="flex items-center text-amber-300">
                  <Award className="h-5 w-5 mr-2" />
                  <span className="font-medium">Registered as IP Asset</span>
                </div>
                {storyElement.registrationDate && (
                  <div className="mt-1 text-sm text-gray-400">
                    Registration Date: {formatDate(storyElement.registrationDate)}
                  </div>
                )}
                {storyElement.registrationTxHash && (
                  <div className="mt-1 text-sm text-gray-400">
                    Transaction: {truncateAddress(storyElement.registrationTxHash)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const toggleAnimationNotes = () => {
    setShowAnimationNotes(!showAnimationNotes)
  }

  const renderAnimationNotes = () => {
    if (!storyElement?.animationNotes) return null

    const animationNotes = storyElement.animationNotes

    return (
      <div className="mt-6 bg-gray-700/30 rounded-lg overflow-hidden">
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
                These animation notes were generated based on the character storyElement.
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
    
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="flex flex-col items-center justify-center p-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-6"></div>
            <p className="text-lg text-gray-300">Loading story element...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }
  
  if (!storyElement || !nft) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Story Element Not Found</h1>
            <p className="text-gray-300 mb-6">
              We couldn&apos;t find the story element you&apos;re looking for. It may have been removed or never existed.
            </p>
            <Link
              href="/losmuertosworld/refinedstoryelements"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Story Elements
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }
  
  const textColorClass = theme === 'light' ? 'text-gray-800' : 'text-gray-200'
  const headingColorClass = theme === 'light' ? 'text-gray-900' : 'text-white'
  
  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'}`}>
      <Header />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-6">
          <Link
            href="/losmuertosworld/refinedstoryelements"
            className="inline-flex items-center text-purple-600 hover:text-purple-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Story Elements
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - NFT Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`${theme === 'light' ? 'bg-white' : 'bg-gray-800'} rounded-xl overflow-hidden shadow-lg`}>
            <div className="relative aspect-square w-full">
            {ipaMetadata?.image ? (
              <Image
                src={ipaMetadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                alt={storyElement.elementTitle || nft.name || `Muerto #${nft.tokenId}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain"
                priority
              />
            ) : nft.image ? (
              <Image
                src={nft.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                alt={nft.name || `Muerto #${nft.tokenId}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}
          </div>
              
              <div className="p-5">
                <h2 className={`text-xl font-bold mb-2 ${headingColorClass}`}>{nft.name || `Los Muertos #${nft.tokenId}`}</h2>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatDate(storyElement.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{truncateAddress(storyElement.walletAddress)}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className={`text-sm font-medium ${getElementTypeColor(storyElement.elementType)} text-white rounded-full px-3 py-1`}>
                    {storyElement.elementType}
                  </div>
                  {storyElement.registeredAsIp && (
                    <div className="text-sm font-medium bg-yellow-600 text-white rounded-full px-3 py-1 flex items-center">
                      <Award className="h-3.5 w-3.5 mr-1" />
                      <span>Registered IP</span>
                    </div>
                  )}
                </div>
                
                {nft.attributes && nft.attributes.length > 0 && (
                  <div className="mt-4">
                    <h3 className={`text-md font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} mb-2`}>Traits</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {nft.attributes
                        .filter(attr => ['Body', 'Mask', 'Headwear', 'Expression'].includes(attr.trait_type as string))
                        .map((attr, i) => (
                          <div key={i} className={`${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700/50'} p-2 rounded`}>
                            <div className="text-xs text-gray-500">{attr.trait_type}</div>
                            <div className={`text-sm font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{attr.value.toString()}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    href={`/losmuertosworld/muertos/${storyElement.tokenId}`}
                    className="w-full inline-flex items-center justify-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat with this Muerto
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Story Element */}
          <div className="lg:col-span-8">
            <div className={`${theme === 'light' ? 'bg-white' : 'bg-gray-800'} rounded-xl shadow-lg overflow-hidden`}>
              <div className={`p-6 border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
                <h1 className={`text-2xl font-bold mb-1 ${headingColorClass}`}>{storyElement.elementTitle}</h1>
                <p className="text-gray-500">Associated with {storyElement.nftTitle}</p>
              </div>
              
              <div className={`p-6 ${theme === 'light' ? 'bg-white' : 'bg-gray-800/80'}`}>
                <div className={`prose max-w-none ${theme === 'light' ? 'prose-gray' : 'prose-invert'}`}>
                  {storyElement.description.split('\n').map((paragraph, index) => (
                    <p key={index} className={`mb-4 ${textColorClass}`}>
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                {/* Narrative Potential Section */}
                {storyElement.narrativePotential && (
                  <div className="mt-6">
                    <h3 className={`text-md font-medium mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                      Narrative Potential
                    </h3>
                    <div className={`${theme === 'light' ? 'bg-purple-50' : 'bg-purple-900/20'} rounded-lg p-4 border ${theme === 'light' ? 'border-purple-200' : 'border-purple-900/30'}`}>
                      <p className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                        {storyElement.narrativePotential}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Cultural Influences Section */}
                {renderCulturalInfluences()}
                
                {/* Relationships Section */}
                {renderRelationships()}
                
                {/* IP Registration Potential Section */}
                {renderIpPotential()}

                {renderAnimationNotes()}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 mb-6">
          <Link
            href="/losmuertosworld/refinedstoryelements"
            className="inline-flex items-center text-purple-600 hover:text-purple-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Story Elements
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}