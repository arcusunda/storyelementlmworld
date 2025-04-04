'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import Image from 'next/image'
import axios from 'axios'
import Link from 'next/link'

interface CharacterName {
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
}

const safeRender = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    const obj = value as CharacterName;
    if (obj.firstName !== undefined && obj.lastName !== undefined) {
      return `${obj.firstName} ${obj.lastName}`;
    }
    return JSON.stringify(value);
  }
  return String(value);
};

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
  hasBackstory?: boolean;
}

interface BackstoryData {
  tokenId: string;
  name: string;
  nftTitle: string;
  characterName?: string;
  backstory: string;
  createdAt: string;
  creatorAddress: string;
  isOwnCreation: boolean;
  image?: string;
}

export default function StoryElementViewer() {
  const { isConnected, address } = useAppKitAccount()
  const [nfts, setNfts] = useState<NFTMetadata[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'staked' | 'unstaked'>('all')
  const [backstories, setBackstories] = useState<Record<string, BackstoryData>>({})
  
  const fetchBackstories = useCallback(async (tokenIds: string[]) => {
    if (!address || tokenIds.length === 0) return {}
    
    try {
      const response = await axios.get(`/api/anthropic/backstory-history?wallet=${address}`)
      
      if (response.data?.history) {
        const backstoryMap: Record<string, BackstoryData> = {}
        
        response.data.history.forEach((item: BackstoryData) => {
          backstoryMap[item.tokenId] = item
          console.info(`Fetched item for tokenId. characterName:  ${item.characterName}:`, item)
        })
        
        return backstoryMap
      }
    } catch (error) {
      console.error('Error fetching backstories:', error)
    }
    
    return {}
  }, [address])
  
  const fetchNFTs = useCallback(async () => {
    if (!address) return
        
    setLoading(true)
    try {
      const response = await axios.get(`/api/alchemy/fetchmetadata?wallet=${address}`)
      const fetchedNfts = response.data.nfts || []
      
      if (fetchedNfts.length === 0) {
        setNfts([])
        setLoading(false)
        return
      }
      
      const tokenIds = fetchedNfts.map((nft: NFTMetadata) => nft.tokenId)
      
      const backstoryMap = await fetchBackstories(tokenIds)
      setBackstories(backstoryMap)
      
      const nftsWithBackstoryFlag = fetchedNfts.map((nft: NFTMetadata) => ({
        ...nft,
        hasBackstory: !!backstoryMap[nft.tokenId]
      }))
      
      setNfts(nftsWithBackstoryFlag)
    } catch (error) {
      console.error('Error fetching NFTs:', error)
    } finally {
      setLoading(false)
    }
  }, [address, fetchBackstories])
  
  useEffect(() => {
    if (isConnected && address) {
      fetchNFTs()
    } else {
      setNfts([])
      setBackstories({})
    }
  }, [isConnected, address, fetchNFTs])

  const formatTimeStaked = (timestamp: number) => {
    if (!timestamp) return 'N/A'
    
    const now = Math.floor(Date.now() / 1000)
    const secondsStaked = now - timestamp
    
    if (secondsStaked < 86400) {
      return `${Math.floor(secondsStaked / 3600)} hours`
    }
    
    if (secondsStaked < 2592000) {
      return `${Math.floor(secondsStaked / 86400)} days`
    }
    
    return `${Math.floor(secondsStaked / 2592000)} months`
  }

  const filteredNfts = nfts.filter(nft => {
    if (!nft.hasBackstory) return false
    
    if (filter === 'all') return true
    if (filter === 'staked') return nft.staked
    if (filter === 'unstaked') return !nft.staked
    return true
  })

  if (!isConnected) {
    return (
      <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
        <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
        <p>Connect your wallet to view your Muertos</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading your Muertos...</p>
        </div>
      </div>
    )
  }

  if (nfts.length === 0 && !loading) {
    return (
      <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md mx-auto mb-6 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500">
              <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1a1a2e" />
                  <stop offset="100%" stopColor="#16213e" />
                </linearGradient>
                <radialGradient id="skullGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="#4361ee" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4361ee" stopOpacity="0" />
                </radialGradient>
              </defs>
              
              {/* Main background */}
              <rect width="600" height="500" fill="url(#bgGradient)" rx="15" ry="15" />
              
              {/* Decorative elements */}
              <circle cx="300" cy="250" r="180" fill="url(#skullGlow)" />
              
              {/* Stylized skull */}
              <g transform="translate(300, 220) scale(1.2)">
                {/* Skull base */}
                <path d="M0,0 C-60,-70 -60,-140 0,-140 C60,-140 60,-70 0,0 Z" fill="#e9eaec" />
                
                {/* Eyes */}
                <path d="M-30,-80 C-40,-80 -40,-60 -30,-60 C-20,-60 -20,-80 -30,-80 Z" fill="#16213e" />
                <path d="M30,-80 C20,-80 20,-60 30,-60 C40,-60 40,-80 30,-80 Z" fill="#16213e" />
                
                {/* Nose */}
                <path d="M0,-60 L10,-40 L0,-30 L-10,-40 Z" fill="#16213e" />
                
                {/* Decorative patterns */}
                <path d="M-50,-130 C-30,-140 30,-140 50,-130" stroke="#4361ee" strokeWidth="3" fill="none" />
                <path d="M-40,-50 C-20,-30 20,-30 40,-50" stroke="#4361ee" strokeWidth="3" fill="none" />
                
                {/* Floral decorations */}
                <circle cx="-45" cy="-110" r="8" fill="#f72585" />
                <circle cx="45" cy="-110" r="8" fill="#f72585" />
                <circle cx="0" cy="-15" r="8" fill="#f72585" />
              </g>
              
              {/* Text */}
              <text x="300" y="350" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="bold" fill="#ffffff" textAnchor="middle">No Muertos Found</text>
              <text x="300" y="385" fontFamily="Arial, sans-serif" fontSize="18" fill="#b8c0c8" textAnchor="middle">Join Los Muertos World</text>
            </svg>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Link
              href="https://opensea.io/collection/los-muertos-world" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <span className="mr-2">Buy on OpenSea</span>
            </Link>
            
            <Link
              href="https://magiceden.io/collections/ethereum/0xc878671ff88f1374d2186127573e4a63931370fc" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center"
            >
              <span className="mr-2">Buy on MagicEden</span>
            </Link>
          </div>
          
          <button 
            onClick={fetchNFTs} 
            className="mt-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  if (filteredNfts.length === 0 && !loading) {
    return (
      <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md mx-auto mb-6 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500">
              <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1a1a2e" />
                  <stop offset="100%" stopColor="#16213e" />
                </linearGradient>
                <radialGradient id="skullGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="#4361ee" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4361ee" stopOpacity="0" />
                </radialGradient>
              </defs>
              
              <rect width="600" height="500" fill="url(#bgGradient)" rx="15" ry="15" />
              <circle cx="300" cy="250" r="180" fill="url(#skullGlow)" />
              
              <g transform="translate(300, 220) scale(1.2)">
                <path d="M0,0 C-60,-70 -60,-140 0,-140 C60,-140 60,-70 0,0 Z" fill="#e9eaec" />
                <path d="M-30,-80 C-40,-80 -40,-60 -30,-60 C-20,-60 -20,-80 -30,-80 Z" fill="#16213e" />
                <path d="M30,-80 C20,-80 20,-60 30,-60 C40,-60 40,-80 30,-80 Z" fill="#16213e" />
                <path d="M0,-60 L10,-40 L0,-30 L-10,-40 Z" fill="#16213e" />
                <path d="M-50,-130 C-30,-140 30,-140 50,-130" stroke="#4361ee" strokeWidth="3" fill="none" />
                <path d="M-40,-50 C-20,-30 20,-30 40,-50" stroke="#4361ee" strokeWidth="3" fill="none" />
                <circle cx="-45" cy="-110" r="8" fill="#f72585" />
                <circle cx="45" cy="-110" r="8" fill="#f72585" />
                <circle cx="0" cy="-15" r="8" fill="#f72585" />
              </g>
              
              <text x="300" y="350" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="bold" fill="#ffffff" textAnchor="middle">No Backstories Found</text>
              <text x="300" y="385" fontFamily="Arial, sans-serif" fontSize="18" fill="#b8c0c8" textAnchor="middle">Create a backstory for your Muertos</text>
            </svg>
          </div>
          
          <div className="mt-4 text-gray-300 text-center max-w-lg">
            <p>You have {nfts.length} Muerto{nfts.length !== 1 ? 's' : ''}, but none of them have backstories yet.</p>
            <p className="mt-2">Create a backstory to unlock story elements and chat with your Muerto.</p>
          </div>
          
          <Link
            href="/assets/"
            className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center"
          >
            Create a Backstory
          </Link>
          
          <button 
            onClick={fetchNFTs} 
            className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-400">
          Found {filteredNfts.length} Muerto{filteredNfts.length !== 1 ? 's' : ''} with backstories.
          {nfts.length > filteredNfts.length && (
            <span> ({nfts.length - filteredNfts.length} Muerto{nfts.length - filteredNfts.length !== 1 ? 's' : ''} hidden - no backstory)</span>
          )}
        </div>
        
        <div className="flex bg-gray-800 rounded-lg overflow-hidden">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-4 py-2 text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('staked')} 
            className={`px-4 py-2 text-sm ${filter === 'staked' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Staked
          </button>
          <button 
            onClick={() => setFilter('unstaked')} 
            className={`px-4 py-2 text-sm ${filter === 'unstaked' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Unstaked
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNfts.map((nft, index) => (
          <div 
            key={`${nft.tokenId}-${index}`} 
            className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] ${nft.staked ? 'border-2 border-blue-500 bg-blue-900/10' : 'border border-gray-700 bg-gray-800/50'}`}
          >
            {nft.image ? (
              <div className="relative w-full pt-[100%]">
                <Link href={`/losmuertosworld/character-storyelement?tokenId=${nft.tokenId}`}>
                  <Image
                    src={nft.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                    alt={nft.name || `Muerto #${nft.tokenId}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain absolute inset-0 cursor-pointer"
                    priority={index < 6}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <span className="text-white text-sm font-medium px-3 py-1 bg-purple-600/80 rounded-full">
                      Create StoryElement
                    </span>
                  </div>
                </Link>
                {nft.staked && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                    STAKED
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full pt-[100%] relative bg-gray-700">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-400">No Image Available</span>
                </div>
              </div>
            )}
            
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-xl">{safeRender(nft.name) || `Los Muertos #${nft.tokenId}`}</h3>
              </div>
              
              {/* Display backstory snippet if available */}
              {backstories[nft.tokenId] && (
                <div className="mt-2 p-2 bg-purple-900/20 border border-purple-700 text-purple-200 text-sm rounded">
                  <div className="font-medium text-purple-300 mb-1">
                    {safeRender(backstories[nft.tokenId].characterName) || "Character Backstory"}:
                  </div>
                  <p className="line-clamp-3">{safeRender(backstories[nft.tokenId].backstory)}</p>
                </div>
              )}
              
              {nft.description && (
                <p className="text-sm text-gray-400 mt-2 line-clamp-3">
                  {safeRender(nft.description)}
                </p>
              )}
              
              {nft.error && (
                <div className="mt-2 p-2 bg-red-900/20 border border-red-700 text-red-400 text-sm rounded">
                  {safeRender(nft.error)}
                </div>
              )}
              
              {nft.staked && nft.stakedAt && (
                <div className="mt-4 text-sm">
                  <div className="flex justify-between items-center text-blue-300">
                    <span>Staked for:</span>
                    <span className="font-medium">{formatTimeStaked(nft.stakedAt)}</span>
                  </div>
                </div>
              )}
              
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href={`/losmuertosworld/character-storyelement?tokenId=${nft.tokenId}`}
                  className="flex items-center justify-center py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Create StoryElement
                </Link>
                <Link
                  href={`/losmuertosworld/muertos/${nft.tokenId}`}
                  className="flex items-center justify-center py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat with Muerto
                </Link>
              </div>
              
              {nft.attributes && nft.attributes.length > 0 && (
                <div className="mt-4">
                  <details className="cursor-pointer">
                    <summary className="text-sm font-medium text-gray-300 mb-2">View Traits</summary>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {nft.attributes.map((attr, i) => (
                        <div key={i} className="bg-gray-700/50 p-2 rounded">
                          <div className="text-xs text-gray-400">{attr.trait_type}</div>
                          <div className="text-sm font-medium">{attr.value.toString()}</div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Button to create backstories if some NFTs have no backstories */}
      {nfts.length > filteredNfts.length && (
        <div className="mt-8 flex justify-center">
          <Link
            href="/assets/"
            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-colors"
          >
            Create Backstories for {nfts.length - filteredNfts.length} More Muerto{nfts.length - filteredNfts.length !== 1 ? 's' : ''}
          </Link>
        </div>
      )}
    </div>
  )
}