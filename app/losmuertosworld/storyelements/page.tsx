'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import Image from 'next/image'
import axios from 'axios'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { BookOpen, RefreshCw, Clock, User } from 'lucide-react'

import dynamic from 'next/dynamic'
const ConnectButton = dynamic(() => import('../../components/ConnectButton'), {
  ssr: false
})

interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

interface StoryElementItem {
  id: string;
  tokenId: string;
  shortId: string;
  characterName: {
    firstName: string;
    lastName: string;
  };
  nftTitle: string;
  storyElement: string;
  createdAt: string;
  creatorAddress: string;
  isActive: boolean;
}

interface MuertoNFT {
  tokenId: string;
  name?: string;
  image?: string;
  attributes?: NFTAttribute[];
}

export default function StoryElementsPage() {
  const { isConnected, address } = useAppKitAccount()
  const [rawStoryElements, setRawStoryElements] = useState<StoryElementItem[]>([])
  const [nfts, setNfts] = useState<Record<string, MuertoNFT>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'mine'>('all')
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const fetchStoryElements = useCallback(async () => {
    setLoading(true)
    try {
      const walletParam = filter === 'mine' && address ? `?wallet=${address}` : ''
      const response = await axios.get<{ rawStoryElements: StoryElementItem[] }>(`/api/storyelements${walletParam}`)
      
      if (response.data.rawStoryElements) {
        const activeStoryElements = response.data.rawStoryElements.filter(rawStoryElement => rawStoryElement.isActive !== false);
        
        const processedStoryElements = await Promise.all(
          activeStoryElements.map(async (storyElement) => {
            if (!storyElement.shortId) {
              try {
                const shortIdResponse = await axios.post('/api/anthropic/create-shortid', {
                  tokenId: storyElement.tokenId,
                  storyElementId: storyElement.id,
                  storyElement: storyElement.storyElement
                });
                
                if (shortIdResponse.data.shortId) {
                  storyElement.shortId = shortIdResponse.data.shortId;
                }
              } catch (error) {
                console.error(`Error generating shortId for storyElement ${storyElement.id}:`, error);
              }
            }
            return storyElement;
          })
        );
        
        setRawStoryElements(processedStoryElements);
        
        const tokenIds: string[] = [...new Set(processedStoryElements.map((item: StoryElementItem) => item.tokenId))]
        await fetchNFTMetadata(tokenIds)
      }
    } catch (error) {
      console.error('Error fetching rawStoryElements:', error)
    } finally {
      setLoading(false)
    }
  }, [address, filter])
  
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
  
  useEffect(() => {
    if (mounted) {
      fetchStoryElements()
    }
  }, [mounted, fetchStoryElements])
  
  const formatDate = (dateString: string) => {
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
            <p>Loading unrefined StoryElements...</p>
          </div>
        </div>
      )
    }

    if (rawStoryElements.length === 0) {
      return (
        <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
          <div className="flex flex-col items-center">
            {/* StoryElement SVG Placeholder */}
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
                  
                  {/* Skull decoration */}
                  <circle cx="0" cy="-30" r="15" fill="#f1f1f1" />
                  <circle cx="-5" cy="-35" r="3" fill="#4361ee" />
                  <circle cx="5" cy="-35" r="3" fill="#4361ee" />
                  <path d="M-5,-25 C-2,-22 2,-22 5,-25" stroke="#4361ee" strokeWidth="2" fill="none" />
                </g>
                
                {/* Text */}
                <text x="300" y="350" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="bold" fill="#ffffff" textAnchor="middle">No StoryElements Found</text>
                <text x="300" y="385" fontFamily="Arial, sans-serif" fontSize="18" fill="#b8c0c8" textAnchor="middle">{filter === 'mine' ? 'Generate your first storyElement!' : 'No storyElements have been created yet.'}</text>
              </svg>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link
                href="/assets-storyelement"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                <span>Create a StoryElement</span>
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
        {rawStoryElements.map((storyElement) => {
          const nft = nfts[storyElement.tokenId]
          const fullName = `${storyElement.characterName.firstName} ${storyElement.characterName.lastName}`
          
          const storyElementUrl = storyElement.shortId 
            ? `/losmuertosworld/storyelements/s/${storyElement.shortId}`
            : `/losmuertosworld/storyelements/${storyElement.tokenId}/${storyElement.id}`;
          
          return (
            <div 
              key={storyElement.id} 
              className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] border border-gray-700 bg-gray-800/50"
            >
              {/* NFT Image */}
              <div className="relative w-full pt-[100%]">
                <Link href={storyElementUrl}>
                  {nft?.image ? (
                    <Image
                      src={nft.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                      alt={storyElement.nftTitle}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain absolute inset-0 cursor-pointer"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">Image Loading...</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="w-full p-4">
                      <h3 className="text-white font-bold text-lg leading-tight">{fullName}</h3>
                      <p className="text-gray-300 text-sm">{storyElement.nftTitle}</p>
                    </div>
                  </div>
                </Link>
              </div>
              
              <div className="p-5">
                {/* StoryElement preview */}
                <div className="mb-4">
                  <h4 className="font-medium text-lg mb-2">StoryElement</h4>
                  <p className="text-sm text-gray-300 line-clamp-3">
                    {storyElement.storyElement.split('\n')[0]}...
                  </p>
                </div>
                
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{formatDate(storyElement.createdAt)}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <User className="h-3.5 w-3.5 mr-1" />
                    <span>{truncateAddress(storyElement.creatorAddress)}</span>
                  </div>
                </div>
                
                {/* Action button */}
                <Link
                  href={storyElementUrl}
                  className="w-full inline-flex items-center justify-center py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read Full StoryElement
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
            <h1 className="text-3xl font-bold mb-4 md:mb-0 text-white">Muerto StoryElements</h1>
            <ConnectButton />
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-300">
              Explore the rich histories and untold tales of muertos within
              <span className="text-purple-400 italic font-medium"> The Violet Reaches </span>
              narrative context.
            </p>

            <div>
              <p className="text-sm text-purple-400 mt-1 italic">Narrative Context: The Violet Reaches</p>
            </div>
            
            <div className="flex bg-gray-700 rounded-lg overflow-hidden">
              <button 
                onClick={() => setFilter('all')} 
                className={`px-4 py-2 text-sm ${filter === 'all' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
              >
                All StoryElements
              </button>
              <button 
                onClick={() => {
                  if (isConnected) {
                    setFilter('mine')
                  } else {
                    alert('Please connect your wallet to view your storyElements')
                  }
                }} 
                className={`px-4 py-2 text-sm ${filter === 'mine' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
              >
                My StoryElements
              </button>
            </div>
          </div>
        </div>
        
        {renderContent()}
        
        <div className="mt-8 flex justify-center">
          <Link
            href="/assets-storyelement"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            <span>Create your own StoryElement</span>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}