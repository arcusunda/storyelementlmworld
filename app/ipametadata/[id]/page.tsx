// /app/ipametadata/[id]/page.tsx
"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import LicenseesSection from '../../components/LicenseesSection'
import { useAppKitAccount } from '@reown/appkit/react'
import { useWalletClient } from 'wagmi'
import { http, custom } from 'viem'
import { Address } from 'viem/accounts'
import axios from 'axios'
import { StoryScanBaseUrl } from '@/utils/utils'
import { StoryClient, StoryConfig, IpMetadata } from '@story-protocol/core-sdk'
import { LicenseTerms } from '@story-protocol/core-sdk';
import { zeroAddress } from 'viem';
import Link from 'next/link';

const ConnectButton = dynamic(() => import('../../components/ConnectButton'), {
  ssr: false
})

const NFTContractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '';

interface RegistrationData {
  ipaId: string;
  ipMetadataURI: string;
  ipMetadataHash: string;
  nftMetadataURI: string;
  nftMetadataHash: string;
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

interface NftAttribute {
  trait_type: string;
  value: string | number;
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
  licenseTermsId?: string | null;
  relationships?: Relationship[];
}

interface PromptData {
  prompt: string;
  negative_prompt?: string;
  parameters?: string;
}

interface ArtPrompts {
  midjourney?: PromptData;
  stablediffusion?: PromptData;
  dalle?: PromptData;
  [key: string]: PromptData | undefined;
}

export default function IpaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isConnected, address } = useAppKitAccount()
  const { data: walletClient } = useWalletClient()
  const [mounted, setMounted] = useState(false)
  const [ipa, setIpa] = useState<IpaMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registrationStep, setRegistrationStep] = useState<string | null>(null)
  const [showLicensees, setShowLicensees] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadStep, setUploadStep] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [artPrompts, setArtPrompts] = useState<ArtPrompts | null>(null)
  const [loadingPrompts, setLoadingPrompts] = useState(false)
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null)
  const [promptCopied, setPromptCopied] = useState<string | null>(null)

  const id = Array.isArray(params.id) ? params.id[0] : params.id
  
  const isOwner = ipa && address && ipa.walletAddress.toLowerCase() === address.toLowerCase()

  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    const fetchIpa = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        const response = await axios.get(`/api/ipametadata/fetchOne?id=${id}`)
        setIpa(response.data.ipametadata || null)
        
        if (response.data.ipametadata?.storyProtocolIpId && 
            (response.data.ipametadata?.licenseTermsId || response.data.ipametadata?.licenseTermsIds)) {
          setShowLicensees(true)
        }
      } catch (error) {
        console.error('Error fetching IPA:', error)
        setError('Failed to load IP asset data')
      } finally {
        setLoading(false)
      }
    }
    
    if (mounted) {
      fetchIpa()
    }
  }, [id, mounted])

  const fetchArtPrompts = useCallback(async () => {
    if (!ipa || !ipa.sourceId) return
    
    setLoadingPrompts(true)
    try {
      console.info(`Fetching art prompts for sourceId: ${ipa.sourceId}`)
      const response = await axios.get(`/api/refinedstoryelements?shortId=${ipa.sourceId}`)
      console.info('Art prompts response:', response.data)
      if (response.data.storyElements && response.data.storyElements.length > 0) {
        const element = response.data.storyElements[0]
        if (element.artPrompts) {
          setArtPrompts(element.artPrompts)
        }
      }
    } catch (error) {
      console.error('Error fetching art prompts:', error)
    } finally {
      setLoadingPrompts(false)
    }
  }, [ipa])
  
  useEffect(() => {
    if (ipa && ipa.sourceId && isOwner) {
      fetchArtPrompts()
    }
  }, [ipa, isOwner, fetchArtPrompts])
  
  const copyPromptToClipboard = (promptType: string, promptText: string) => {
    navigator.clipboard.writeText(promptText)
      .then(() => {
        setPromptCopied(promptType)
        setTimeout(() => setPromptCopied(null), 2000)
      })
      .catch(err => {
        console.error('Failed to copy:', err)
      })
  }

  type NetworkType = 'aeneid' | 'mainnet'

  interface NetworkConfig {
      rpcProviderUrl: string
      protocolExplorer: string
      defaultNFTContractAddress: Address | null
      defaultSPGNFTContractAddress: Address | null
  }
  
const networkConfigs: Record<NetworkType, NetworkConfig> = {
    aeneid: {
        rpcProviderUrl: 'https://aeneid.storyrpc.io',
        protocolExplorer: 'https://aeneid.storyscan.io',
        defaultNFTContractAddress: '0x937bef10ba6fb941ed84b8d249abc76031429a9a' as Address,
        defaultSPGNFTContractAddress: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc' as Address,
    },
    mainnet: {
        rpcProviderUrl: 'https://mainnet.storyrpc.io',
        protocolExplorer: 'https://explorer.story.foundation',
        defaultNFTContractAddress: null,
        defaultSPGNFTContractAddress: null,
    },
} as const

const getNetwork = (): NetworkType => {
      const network = process.env.STORY_NETWORK as NetworkType
      if (network && !(network in networkConfigs)) {
          throw new Error(`Invalid network: ${network}. Must be one of: ${Object.keys(networkConfigs).join(', ')}`)
      }
      return network || 'aeneid'
  }
  
  const network = getNetwork()
  
  const networkInfo = {
      ...networkConfigs[network],
      rpcProviderUrl: process.env.RPC_PROVIDER_URL || networkConfigs[network].rpcProviderUrl,
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file')
        return
      }
      
      setImageFile(file)
      setUploadError(null)
    }
  }
  
  const handleImageUpload = async () => {
    if (!imageFile || !ipa || !isConnected || !address) {
      setUploadError('Please select an image file and ensure your wallet is connected')
      return
    }
    
    setUploadingImage(true)
    setUploadStep('Preparing image...')
    setUploadError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', imageFile)
      formData.append('ipaId', ipa._id)
      formData.append('wallet', address)
      
      setUploadStep('Uploading to IPFS...')
      
      const response = await fetch('/api/ipametadata/uploadImage', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image')
      }
      
      setUploadStep('Updating metadata...')
      
      setIpa({
        ...ipa,
        image: data.imageUrl,
        imageHash: data.imageHash,
        mediaUrl: data.imageUrl,
        mediaHash: data.imageHash,
        mediaType: imageFile.type
      })
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setImageFile(null)
      
    } catch (error) {
      console.error('Error uploading image:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setUploadingImage(false)
      setUploadStep(null)
    }
  }

  const generateIpMetadata = (ipData: IpaMetadata): IpMetadata => {
  const config: StoryConfig = {
    wallet: walletClient,
    transport: http(networkInfo.rpcProviderUrl),
    chainId: "aeneid",
  };
  
  const metadataClient = StoryClient.newClient(config);
  
  return metadataClient.ipAsset.generateIpMetadata({
    title: ipData.title,
    description: ipData.description,
    createdAt: ipData.createdAt.toString(),
    creators: ipData.creators?.map((creator: { name: string; address: string; contributionPercent: number }) => ({
      name: creator.name,
      address: creator.address as `0x${string}`,
      contributionPercent: creator.contributionPercent,
    })) || [{
      name: 'Story Element for Los Muertos World',
      address: address as `0x${string}`,
      contributionPercent: 100,
    }],
    image: ipData.image,
    imageHash: `0x${ipData.imageHash.replace(/^0x/, '')}` as `0x${string}`,
    mediaUrl: ipData.mediaUrl,
    mediaHash: `0x${ipData.mediaHash.replace(/^0x/, '')}` as `0x${string}`,
    mediaType: ipData.mediaType,
  });
};

const generateNftMetadata = (ipData: IpaMetadata) => {
  return {
    name: ipData.title,
    description: ipData.description,
    image: ipData.image,
    animation_url: ipData.mediaUrl,
    attributes: ipData.nftAttributes || ipData.tags?.map((tag: string) => ({
      trait_type: 'Tag',
      value: tag,
    })) || [],
  };
};

const commercialRemixTerms: LicenseTerms = {
  transferable: true,
  royaltyPolicy: '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E',
  defaultMintingFee: 0n,
  expiration: 0n,
  commercialUse: true,
  commercialAttribution: true,
  commercializerChecker: zeroAddress,
  commercializerCheckerData: zeroAddress,
  commercialRevShare: 50, // can claim 50% of derivative revenue
  commercialRevCeiling: 0n,
  derivativesAllowed: true,
  derivativesAttribution: true,
  derivativesApproval: false,
  derivativesReciprocal: true,
  derivativeRevCeiling: 0n,
  currency: '0x1514000000000000000000000000000000000000', // $WIP address from https://docs.story.foundation/docs/deployed-smart-contracts
  uri: '',
}
  
  const handleRegisterWithStoryProtocol = async () => {
    if (!ipa || !isConnected || !address || !walletClient) {
      setError('Please connect your wallet first')
      return
    }
    
    setRegistering(true)
    setRegistrationStep('Preparing metadata...')
    setError(null)
    
    try {
      const ipMetadata = generateIpMetadata(ipa);
      const nftMetadata = generateNftMetadata(ipa);
      
      setRegistrationStep('Uploading metadata to IPFS...')
      
      const response = await axios.post('/api/storyprotocol/register', {
        ipaId: ipa._id,
        wallet: address,
        ipMetadata,
        nftMetadata
      });
      
      if (!response.data.success || !response.data.registrationData) {
        throw new Error(response.data.error || 'Failed to prepare metadata')
      }
      
      const registrationData: RegistrationData = response.data.registrationData
        
      setRegistrationStep('Initializing blockchain connection...')
      
      async function setupStoryClient() {
        if (!walletClient) {
          throw new Error("Wallet client is not available");
        }
        
        const config: StoryConfig = {
          wallet: walletClient,
          transport: custom(walletClient.transport),
          chainId: "aeneid",
        }
        
        return StoryClient.newClient(config)
      }
      
      const storyClient = await setupStoryClient()
      
      try {
        setRegistrationStep('Requesting wallet signature...')
        
        const formattedNFTContractAddress = NFTContractAddress as `0x${string}`;

        const responseFromMintAndRegisterIpAssetWithPilTerms = await storyClient.ipAsset.mintAndRegisterIpAssetWithPilTerms({
          spgNftContract: formattedNFTContractAddress,
          licenseTermsData: [{ terms: commercialRemixTerms }],
          // https://docs.story.foundation/docs/ip-asset#adding-nft--ip-metadata-to-ip-asset
          ipMetadata: {
            ipMetadataURI: registrationData.ipMetadataURI,
            ipMetadataHash: registrationData.ipMetadataHash as `0x${string}`,
            nftMetadataHash: registrationData.nftMetadataHash as `0x${string}`,
            nftMetadataURI: registrationData.nftMetadataURI,
          },
          txOptions: { waitForTransaction: true },
        })
        
        console.log(`
          Token ID: ${responseFromMintAndRegisterIpAssetWithPilTerms.tokenId}, 
          IPA ID: ${responseFromMintAndRegisterIpAssetWithPilTerms.ipId}, 
          License Terms ID: ${responseFromMintAndRegisterIpAssetWithPilTerms.licenseTermsIds}
        `)

        setRegistrationStep('Updating records...')
        await axios.post('/api/storyprotocol/updateRecord', {
          ipaId: ipa._id,
          storyProtocolIpId: responseFromMintAndRegisterIpAssetWithPilTerms.ipId,
          storyProtocolTxHash: responseFromMintAndRegisterIpAssetWithPilTerms.txHash,
          licenseTermsIds: responseFromMintAndRegisterIpAssetWithPilTerms.licenseTermsIds?.toString() ?? '',
          storyProtocolRegisteredAt: new Date().toISOString()
        })
        
        setIpa({
          ...ipa,
          storyProtocolIpId: responseFromMintAndRegisterIpAssetWithPilTerms.ipId,
          storyProtocolTxHash: responseFromMintAndRegisterIpAssetWithPilTerms.txHash,
          licenseTermsId: responseFromMintAndRegisterIpAssetWithPilTerms.licenseTermsIds?.toString() ?? '',
          storyProtocolRegisteredAt: new Date().toISOString()
        })
        
        setShowLicensees(true)
        
        setRegistrationStep(null)
      } catch (txError) {
        console.error('Transaction error:', txError)
        throw new Error('Failed to sign or submit transaction. Please try again.')
      }
      
    } catch (error) {
      console.error('Error registering IPA:', error)
      setError(error instanceof Error ? error.message : 'Failed to register with Story Network')
    } finally {
      setRegistering(false)
      setRegistrationStep(null)
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
        {/* Testnet Notice Banner */}
        <div className="mt-8 mb-8 bg-gray-800/80 border border-blue-500/30 rounded-xl p-4 shadow-lg text-center">
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
              <h1 className="text-3xl font-bold text-white">IP Asset Details</h1>
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
                
                {/* Registration status badge */}
                <div className="p-4 border-t border-gray-700">
                  <div className={`flex items-center justify-center p-2 rounded ${ipa.storyProtocolIpId ? 'bg-green-900/20 border border-green-700' : 'bg-gray-700'}`}>
                    <span className={`font-medium ${ipa.storyProtocolIpId ? 'text-green-400' : 'text-gray-300'}`}>
                      {ipa.storyProtocolIpId ? (
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Registered with Story Network
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                          Not Registered
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                
                {/* Register button (only show for owner and if not already registered) */}
                {isOwner && !ipa.storyProtocolIpId && (
                  <div className="p-4 pt-0 border-t border-gray-700">

                  {isOwner && artPrompts && (
                    <div className="mb-4">
                      <div 
                        className="flex items-center justify-between bg-gray-700/30 p-2 rounded cursor-pointer mb-2"
                        onClick={() => setExpandedPrompt(expandedPrompt ? null : 'all')}
                      >
                        <span className="font-medium">AI Art Prompts</span>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-5 w-5 transition-transform ${expandedPrompt ? 'transform rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      
                      {expandedPrompt && (
                        <div className="space-y-2 mb-3 rounded bg-gray-800/70 p-3 animate-fadeIn text-sm">
                          <p className="text-gray-300 text-xs mb-2">
                            Use these AI art prompts to generate images that align with your story element. 
                            Click to copy each prompt.
                          </p>
                          
                          {Object.entries(artPrompts).map(([service, data]) => {
                            if (!data || !data.prompt) return null;
                            
                            return (
                              <div key={service} className="border-b border-gray-700 pb-2 last:border-b-0 last:pb-0">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium capitalize text-blue-400">{service}</h5>
                                  <button 
                                    onClick={() => copyPromptToClipboard(service, data.prompt)}
                                    className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                                  >
                                    {promptCopied === service ? 'Copied!' : 'Copy'}
                                  </button>
                                </div>
                                <div className="mt-1 bg-gray-900/50 p-2 rounded text-xs text-gray-300 max-h-24 overflow-y-auto">
                                  {data.prompt}
                                </div>
                                {data.negative_prompt && (
                                  <div className="mt-1">
                                    <span className="text-xs text-gray-400">Negative prompt:</span>
                                    <div className="bg-gray-900/50 p-2 rounded text-xs text-gray-300 max-h-16 overflow-y-auto">
                                      {data.negative_prompt}
                                    </div>
                                  </div>
                                )}
                                {data.parameters && (
                                  <div className="mt-1">
                                    <span className="text-xs text-gray-400">Parameters:</span>
                                    <div className="bg-gray-900/50 p-2 rounded text-xs text-gray-300">
                                      {data.parameters}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {loadingPrompts && (
                    <div className="flex items-center mb-4 text-sm text-gray-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                      Loading prompts...
                    </div>
                  )}


                  <>
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {isOwner && (
                      <div className="mt-4">
                        <div className="flex items-center mb-2">
                          <span className="text-sm text-gray-400">
                            {imageFile ? imageFile.name : 'No file selected'}
                          </span>
                        </div>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 py-2 px-3 rounded bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
                            disabled={uploadingImage}
                          >
                            Choose Image
                          </button>
                          <button
                            onClick={handleImageUpload}
                            disabled={!imageFile || uploadingImage || !isConnected}
                            className={`flex-1 py-2 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors ${(!imageFile || uploadingImage || !isConnected) ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                            {uploadingImage ? (
                              <span className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                {uploadStep || 'Uploading...'}
                              </span>
                            ) : 'Upload Image'}
                          </button>
                        </div>
                        {uploadError && (
                          <div className="mt-2 text-sm text-red-400">
                            {uploadError}
                          </div>
                        )}
                      </div>
                    )}
                  </>


                    <button
                      onClick={handleRegisterWithStoryProtocol}
                      disabled={registering || !isConnected}
                      className={`w-full mt-4 py-3 px-4 rounded bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-colors ${(registering || !isConnected) ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {!isConnected ? (
                        'Connect Wallet to Register'
                      ) : registering ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          {registrationStep || 'Registering...'}
                        </span>
                      ) : 'Register with Story Network'}
                    </button>
                  </div>
                )}
                
                {/* Link to license page (only show if registered) */}
                {ipa.storyProtocolIpId && ipa.licenseTermsId && (
                  <div className="p-4 pt-0 border-t border-gray-700">
                    <a
                      href={`/licenses/${ipa._id}`}
                      className="block w-full py-3 px-4 rounded bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium transition-colors text-center"
                    >
                      View License Page
                    </a>
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
                  
                  {ipa.sourceType && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Source Type:</span>
                      <span className="font-medium">{ipa.sourceType}</span>
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
                
                {/* Story Network section */}
                {ipa.storyProtocolIpId && (
                  <div className="mt-6 bg-green-900/10 border border-green-700/40 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Story Network Registration</h3>
                    
                    <div className="space-y-2">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-400">IP ID:</span>
                        <div className="bg-gray-900/50 p-2 rounded mt-1 break-all">
                          {ipa.storyProtocolIpId}
                        </div>
                      </div>
                      
                      {ipa.storyProtocolTxHash && (
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-400">Transaction Hash:</span>
                          <div className="bg-gray-900/50 p-2 rounded mt-1 break-all">
                            <a 
                              href={`https://${StoryScanBaseUrl}/tx/${ipa.storyProtocolTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              {ipa.storyProtocolTxHash}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {ipa.storyProtocolParentIpId && (
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-400">Parent IP ID:</span>
                          <div className="bg-gray-900/50 p-2 rounded mt-1 break-all">
                            {ipa.storyProtocolParentIpId}
                          </div>
                        </div>
                      )}
                      
                      {ipa.licenseTermsId && (
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-400">License Terms ID:</span>
                          <div className="bg-gray-900/50 p-2 rounded mt-1 break-all">
                            {ipa.licenseTermsId}
                          </div>
                        </div>
                      )}
                      
                      {ipa.storyProtocolRegisteredAt && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Registered At:</span>
                          <span>{formatDate(ipa.storyProtocolRegisteredAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Licensees section */}
                {showLicensees && ipa.storyProtocolIpId && (
                  <LicenseesSection 
                    ipId={ipa.storyProtocolIpId} 
                    isHidden={!showLicensees}
                  />
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
                
                {/* Relationships */}
                {ipa.relationships && ipa.relationships.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Relationships</h3>
                    <div className="space-y-2">
                      {ipa.relationships.map((rel, index) => (
                        <div key={index} className="bg-gray-700/30 p-3 rounded-lg">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Relationship:</span>
                            <span className="font-medium">{rel.type}</span>
                          </div>
                          <div className="mt-1">
                            <span className="text-sm text-gray-400">Parent IP ID:</span>
                            <div className="bg-gray-900/50 p-2 rounded mt-1 break-all text-sm">
                              {rel.parentIpId}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Attributes / NFT Properties */}
                {ipa.nftAttributes && ipa.nftAttributes.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Properties</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {ipa.nftAttributes.map((attr, index) => (
                        <div key={index} className="bg-gray-700/30 p-3 rounded-lg">
                          <div className="text-xs text-gray-400">{attr.trait_type}</div>
                          <div className="text-sm font-medium">{attr.value.toString()}</div>
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