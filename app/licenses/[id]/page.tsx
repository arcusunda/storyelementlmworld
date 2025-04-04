// app/licenses/[id]/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { useAppKitAccount } from '@reown/appkit/react'
import { useWalletClient } from 'wagmi'
import { custom } from 'viem'
import axios from 'axios'
import { StoryScanBaseUrl } from '@/utils/utils'
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk'
import Link from 'next/link';

const ConnectButton = dynamic(() => import('../../components/ConnectButton'), {
  ssr: false
})

interface NftAttribute {
  trait_type: string;
  value: string | number;
}

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

interface Relationship {
  parentIpId: string;
  type: string;
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
  nftAttributes?: NftAttribute[];
  creators?: Creator[];
  ipType?: string;
  tags?: string[];
  sourceId?: string;
  sourceType?: string;
  storyProtocolIpId?: string;
  storyProtocolTxHash?: string;
  storyProtocolRegisteredAt?: string;
  storyProtocolParentIpId?: string;
  licenseTermsIds?: string;
  relationships?: Relationship[];
}

interface LicenseToken {
  tokenId: string;
  licenseTermsId: string;
  licensorIpId: string;
  mintedAt: string;
  txHash: string;
  owner: string;
}

export default function LicenseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isConnected, address } = useAppKitAccount()
  const { data: walletClient } = useWalletClient()
  const [mounted, setMounted] = useState(false)
  const [ipa, setIpa] = useState<IpaMetadata | null>(null)
  const [licenseTokens, setLicenseTokens] = useState<LicenseToken[]>([])
  const [loading, setLoading] = useState(true)
  const [minting, setMinting] = useState(false)
  const [mintingStep, setMintingStep] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [licenseAmount, setLicenseAmount] = useState(1)
  
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        const ipaResponse = await axios.get(`/api/ipametadata/fetchOne?id=${id}`)
        setIpa(ipaResponse.data.ipametadata || null)
        
        if (isConnected && address && ipaResponse.data.ipametadata?.storyProtocolIpId) {
          try {
            const licenseResponse = await axios.get(`/api/licenses/fetchTokens?ipId=${ipaResponse.data.ipametadata.storyProtocolIpId}&wallet=${address}`)
            setLicenseTokens(licenseResponse.data.licenseTokens || [])
          } catch (error) {
            console.error('Error fetching license tokens:', error)
          }
        }
      } catch (error) {
        console.error('Error fetching IPA:', error)
        setError('Failed to load IP asset data')
      } finally {
        setLoading(false)
      }
    }
    
    if (mounted) {
      fetchData()
    }
  }, [id, mounted, isConnected, address])
  
  const handleMintLicenseToken = async () => {
    if (!ipa || !isConnected || !address || !walletClient || !ipa.storyProtocolIpId || !ipa.licenseTermsIds) {
      setError('Cannot mint license token. Please check your wallet connection and that the IP asset has valid license terms.')
      return
    }
    
    setMinting(true)
    setMintingStep('Initializing...')
    setError(null)
    
    try {
      setMintingStep('Setting up Story client...')
      
      const config: StoryConfig = {
        wallet: walletClient,
        transport: custom(walletClient.transport),
        chainId: "aeneid",
      }
      
      const storyClient = StoryClient.newClient(config)
      
      setMintingStep('Requesting wallet signature...')
      
      const response = await storyClient.license.mintLicenseTokens({
        licenseTermsId: ipa.licenseTermsIds,
        licensorIpId: `0x${ipa.storyProtocolIpId.replace(/^0x/, '')}` as `0x${string}`,
        receiver: address as `0x${string}`,
        amount: licenseAmount,
        maxMintingFee: BigInt(0),
        maxRevenueShare: 100,
        txOptions: { waitForTransaction: true }
      })
      
      setMintingStep('Updating records...')
      
      const newLicenseTokens: LicenseToken[] = (response.licenseTokenIds ?? []).map(tokenId => ({
        tokenId: tokenId.toString(),
        licenseTermsId: ipa.licenseTermsIds || '',
        licensorIpId: ipa.storyProtocolIpId || '',
        mintedAt: new Date().toISOString(),
        txHash: response.txHash || '',
        owner: address
      }))

      await axios.post('/api/licenses/recordMinting', {
        ipaId: ipa._id,
        licensorIpId: ipa.storyProtocolIpId,
        licenseTermsId: ipa.licenseTermsIds,
        licenseTokenIds: (response.licenseTokenIds ?? []).map(id => id.toString()),
        wallet: address,
        txHash: response.txHash
      })
      
      setLicenseTokens([...licenseTokens, ...newLicenseTokens])
      
      setMintingStep(null)
    } catch (error) {
      console.error('Error minting license token:', error)
      setError(error instanceof Error ? error.message : 'Failed to mint license token')
    } finally {
      setMinting(false)
      setMintingStep(null)
    }
  }
  
  const formatDate = (timestamp: string | number) => {
    if (!timestamp) return 'N/A'
    
    const date = new Date(typeof timestamp === 'string' ? 
      (timestamp.includes('T') ? timestamp : parseInt(timestamp) * 1000) : 
      timestamp)
      
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (!mounted) return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
          {/* Loading skeleton */}
          <div className="bg-gray-800 rounded-xl p-6 h-32 w-full" />
        </div>
      </div>
      <Footer />
    </div>
  )
  
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Testnet Notice Banner - with more subtle styling */}
        <div className="mb-8 bg-gray-800/80 border border-blue-500/30 rounded-xl p-4 shadow-lg text-center">
          <div className="flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-blue-400">Testnet Environment</span>
          </div>
          <p className="text-gray-300">
            Currently, licensing occurs on Story Network&apos;s{' '}
            <Link 
              href="https://docs.story.foundation/network/network-info/aeneid" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-blue-400 hover:underline"
            >
              Aeneid Testnet
            </Link>
            . Before we launch to Mainnet, transactions are for testing purposes only and do not involve real assets or value. For now, enjoy your stories, try our IP registration process, and stay tuned for updates about Mainnet launch!
          </p>
        </div>
        
        <div className="mb-8 bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <button 
                onClick={() => router.back()} 
                className="flex items-center text-blue-400 hover:text-blue-300 mb-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <h1 className="text-3xl font-bold text-white">License Details</h1>
            </div>
            <ConnectButton />
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p>Loading IP asset details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
            <div className="text-red-400 mb-4">{error}</div>
            <button 
              onClick={() => setError(null)} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Dismiss
            </button>
          </div>
        ) : !ipa ? (
          <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">IP Asset Not Found</h2>
            <p>The requested IP asset could not be found.</p>
            <button 
              onClick={() => router.back()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        ) : !ipa.storyProtocolIpId || !ipa.licenseTermsIds ? (
          <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">Not Available for Licensing</h2>
            <p>This IP asset is not registered with Story Network or does not have license terms.</p>
            <button 
              onClick={() => router.back()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="relative w-full pt-[100%]">
                  <Image
                    src={ipa.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                    alt={ipa.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-contain"
                  />
                </div>
                
                {/* License status badge */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex items-center justify-center p-2 rounded bg-purple-900/20 border border-purple-700">
                    <span className="font-medium text-purple-400">
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Available for Licensing
                      </span>
                    </span>
                  </div>
                </div>
                
                {/* Mint license token form */}
                {isConnected ? (
                  <div className="p-4 pt-0 border-t border-gray-700">
                    <div className="mb-4">
                      <label htmlFor="licenseAmount" className="block text-sm font-medium text-gray-400 mb-1">
                        Number of Licenses:
                      </label>
                      <input
                        type="number"
                        id="licenseAmount"
                        min="1"
                        max="10"
                        value={licenseAmount}
                        onChange={(e) => setLicenseAmount(Math.max(1, Math.min(10, parseInt(e.target.value))))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      />
                    </div>
                    
                    <button
                      onClick={handleMintLicenseToken}
                      disabled={minting || !isConnected}
                      className={`w-full py-3 px-4 rounded bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium transition-colors ${(minting || !isConnected) ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {!isConnected ? (
                        'Connect Wallet'
                      ) : minting ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          {mintingStep || 'Minting...'}
                        </span>
                      ) : 'Mint License Token'}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 border-t border-gray-700 text-center text-gray-400">
                    Connect your wallet to mint license tokens
                  </div>
                )}
              </div>
              
              {/* IP Type and Meta info */}
              <div className="mt-6 bg-gray-800 rounded-xl shadow-lg overflow-hidden p-4">
                <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Asset Information</h3>
                
                <div className="space-y-3">
                  {ipa.ipType && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Asset Type:</span>
                      <span className="font-medium">{ipa.ipType}</span>
                    </div>
                  )}
                  
                  {ipa.tokenId && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Token ID:</span>
                      <span className="font-medium">{ipa.tokenId}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created:</span>
                    <span className="font-medium">{formatDate(ipa.createdAt)}</span>
                  </div>
                  
                  {ipa.mediaType && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Media Type:</span>
                      <span className="font-medium">{ipa.mediaType}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden p-6">
                <h2 className="text-2xl font-bold">{ipa.title}</h2>
                
                {/* License section */}
                <div className="mt-6 bg-purple-900/10 border border-purple-700/40 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-400 mb-2">License Information</h3>
                  
                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400">IP ID:</span>
                      <div className="bg-gray-900/50 p-2 rounded mt-1 break-all">
                        <a 
                          href={`https://${StoryScanBaseUrl}/ip/${ipa.storyProtocolIpId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {ipa.storyProtocolIpId}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400">License Terms ID:</span>
                      <div className="bg-gray-900/50 p-2 rounded mt-1 break-all">
                        <a 
                          href={`https://${StoryScanBaseUrl}/license/${ipa.licenseTermsIds}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {ipa.licenseTermsIds}
                        </a>
                      </div>
                    </div>
                    
                    {ipa.storyProtocolRegisteredAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Registered At:</span>
                        <span>{formatDate(ipa.storyProtocolRegisteredAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Your license tokens section */}
                {isConnected && licenseTokens.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Your License Tokens</h3>
                    <div className="space-y-3">
                      {licenseTokens.map((token, index) => (
                        <div key={index} className="bg-gray-700/30 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Token ID: {token.tokenId}</span>
                            <span className="text-xs bg-purple-900/50 text-purple-200 rounded-full px-2 py-1">
                              Active
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-400">
                            Minted: {formatDate(token.mintedAt)}
                          </div>
                          {token.txHash && (
                            <div className="mt-2">
                              <a 
                                href={`https://${StoryScanBaseUrl}/tx/${token.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-400 hover:text-blue-300"
                              >
                                View Transaction
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <div className="bg-gray-700/30 p-4 rounded-lg whitespace-pre-line">
                    {ipa.description}
                  </div>
                </div>
                
                {/* Creators */}
                {ipa.creators && ipa.creators.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Creators</h3>
                    <div className="space-y-4">
                      {ipa.creators.map((creator, index) => (
                        <div key={index} className="bg-gray-700/30 p-4 rounded-lg">
                          <div className="flex justify-between">
                            <span className="font-medium">{creator.name}</span>
                            <span className="text-gray-400">{creator.contributionPercent}%</span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1 break-all">
                            {creator.address}
                          </div>
                          {creator.description && (
                            <div className="mt-2 text-sm">{creator.description}</div>
                          )}
                          {creator.socialMedia && creator.socialMedia.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {creator.socialMedia.map((social, i) => (
                                <a 
                                  key={i}
                                  href={social.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 text-sm"
                                >
                                  {social.platform}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Tags */}
                {ipa.tags && ipa.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {ipa.tags.map((tag, i) => (
                        <span key={i} className="bg-gray-700/50 px-3 py-1 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Media preview */}
                {ipa.mediaUrl && ipa.mediaUrl !== ipa.image && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Media</h3>
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      {ipa.mediaType?.includes('image') ? (
                        <div className="relative w-full pt-[56.25%]">
                          <Image
                            src={ipa.mediaUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                            alt={`Media for ${ipa.title}`}
                            fill
                            className="object-contain rounded"
                          />
                        </div>
                      ) : ipa.mediaType?.includes('audio') ? (
                        <audio 
                          controls 
                          className="w-full" 
                          src={ipa.mediaUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      ) : ipa.mediaType?.includes('video') ? (
                        <video 
                          controls 
                          className="w-full rounded" 
                          src={ipa.mediaUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="text-center text-gray-400">
                          <a 
                            href={ipa.mediaUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            View Media
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}