'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import Image from 'next/image'
import axios from 'axios'
import Link from 'next/link'

interface Creator {
  address: string;
  name: string;
  description?: string;
  contributionPercent: number;
  socialMedia?: {
    platform: string;
    url: string;
  }[];
}

interface IpaMetadata {
  _id: string;
  title: string;
  description: string;
  createdAt: string | number;
  image: string;
  imageHash: string;
  mediaUrl: string;
  mediaHash: string;
  mediaType: string;
  tokenId?: string;
  walletAddress: string;
  nftAttributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  creators?: Creator[];
  ipType?: string;
  tags?: string[];
  sourceId?: string;
  sourceType?: string;
  storyProtocolIpId?: string;
  storyProtocolTxHash?: string;
  storyProtocolRegisteredAt?: string;
  storyProtocolParentIpId?: string;
}

export default function IpaViewer() {
  const { isConnected, address } = useAppKitAccount()
  const [ipas, setIpas] = useState<IpaMetadata[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'registered' | 'unregistered'>('all')
  
  const fetchIpas = useCallback(async () => {
    if (!address) return
        
    setLoading(true)
    try {
      const response = await axios.get(`/api/ipametadata/fetch?wallet=${address}`)
      setIpas(response.data.ipametadata || [])
    } catch (error) {
      console.error('Error fetching IPAs:', error)
    } finally {
      setLoading(false)
    }
  }, [address])
  
  useEffect(() => {
    if (isConnected && address) {
      fetchIpas()
    } else {
      setIpas([])
    }
  }, [isConnected, address, fetchIpas])
  
  const formatDate = (timestamp: string | number) => {
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const filteredIpas = ipas.filter(ipa => {
    if (filter === 'all') return true
    if (filter === 'registered') return !!ipa.storyProtocolIpId
    if (filter === 'unregistered') return !ipa.storyProtocolIpId
    return true
  })

  if (!isConnected) {
    return (
      <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
        <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
        <p>Connect your wallet to view your IP assets</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading your IP assets...</p>
        </div>
      </div>
    )
  }

  if (ipas.length === 0 && !loading) {
    return (
      <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
        <div className="flex flex-col items-center">
          {/* IP Asset Empty State SVG */}
          <div className="w-full max-w-md mx-auto mb-6 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500">
              <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1a1a2e" />
                  <stop offset="100%" stopColor="#16213e" />
                </linearGradient>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="#4361ee" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4361ee" stopOpacity="0" />
                </radialGradient>
              </defs>
              
              {/* Main background */}
              <rect width="600" height="500" fill="url(#bgGradient)" rx="15" ry="15" />
              
              {/* Decorative elements */}
              <circle cx="300" cy="250" r="180" fill="url(#glow)" />
              
              {/* Stylized document icon */}
              <g transform="translate(300, 220) scale(1.2)">
                <rect x="-50" y="-70" width="100" height="120" fill="#e9eaec" rx="5" ry="5" />
                <rect x="-40" y="-60" width="80" height="10" fill="#16213e" rx="2" ry="2" />
                <rect x="-40" y="-40" width="80" height="10" fill="#16213e" rx="2" ry="2" />
                <rect x="-40" y="-20" width="60" height="10" fill="#16213e" rx="2" ry="2" />
                <circle cx="30" cy="20" r="15" fill="#f72585" />
                <path d="M20,20 L40,20" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <path d="M30,10 L30,30" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </g>
              
              {/* Text */}
              <text x="300" y="350" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="bold" fill="#ffffff" textAnchor="middle">No IP-ready Story Elements found.</text>
              <text x="300" y="385" fontFamily="Arial, sans-serif" fontSize="18" fill="#b8c0c8" textAnchor="middle">If you recently created a Story Element then it is likely still in the refinement pipeline. Please try again soon.</text>
            </svg>
          </div>
          
          <button 
            onClick={fetchIpas} 
            className="mt-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
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
          Found {ipas.length} IP asset{ipas.length !== 1 ? 's' : ''}. Register them with Story Network.
        </div>
        
        <div className="flex bg-gray-800 rounded-lg overflow-hidden">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-4 py-2 text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('registered')} 
            className={`px-4 py-2 text-sm ${filter === 'registered' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Registered
          </button>
          <button 
            onClick={() => setFilter('unregistered')} 
            className={`px-4 py-2 text-sm ${filter === 'unregistered' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Unregistered
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIpas.map((ipa) => (
          <div 
            key={ipa._id} 
            className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] ${ipa.storyProtocolIpId ? 'border-2 border-green-500 bg-green-900/10' : 'border border-gray-700 bg-gray-800/50'}`}
          >
            {ipa.image ? (
              <div className="relative w-full pt-[100%]">
                <Link href={`/ipametadata/${ipa._id}`}>
                  <Image
                    src={ipa.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                    alt={ipa.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain absolute inset-0 cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <span className="text-white text-sm font-medium px-3 py-1 bg-purple-600/80 rounded-full">
                      View Details
                    </span>
                  </div>
                </Link>
                {ipa.storyProtocolIpId && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                    REGISTERED
                  </div>
                )}
                {ipa.ipType && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                    {ipa.ipType}
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
                <h3 className="font-bold text-xl truncate">{ipa.title}</h3>
              </div>
              
              {ipa.description && (
                <p className="text-sm text-gray-400 mt-2 line-clamp-3">
                  {ipa.description}
                </p>
              )}
              
              <div className="mt-4 text-sm">
                <div className="flex justify-between items-center text-gray-400">
                  <span>Created:</span>
                  <span className="font-medium">{formatDate(ipa.createdAt)}</span>
                </div>
                
                {ipa.tokenId && (
                  <div className="flex justify-between items-center text-gray-400 mt-1">
                    <span>Token ID:</span>
                    <span className="font-medium">{ipa.tokenId}</span>
                  </div>
                )}
                
                {ipa.storyProtocolIpId && (
                  <div className="flex justify-between items-center text-green-400 mt-1">
                    <span>IP ID:</span>
                    <span className="font-medium truncate max-w-[120px]" title={ipa.storyProtocolIpId}>
                      {ipa.storyProtocolIpId.substring(0, 10)}...
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <Link
                  href={`/ipametadata/${ipa._id}`}
                  className="flex items-center justify-center py-2 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Asset Details
                </Link>
              </div>
              
              {ipa.tags && ipa.tags.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {ipa.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="bg-gray-700/50 px-2 py-1 rounded text-xs text-gray-300">
                        {tag}
                      </span>
                    ))}
                    {ipa.tags.length > 3 && (
                      <span className="bg-gray-700/50 px-2 py-1 rounded text-xs text-gray-300">
                        +{ipa.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}