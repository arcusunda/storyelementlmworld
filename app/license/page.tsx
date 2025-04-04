// app/registration/page.tsx
"use client"

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAppKitAccount } from '@reown/appkit/react'
import axios from 'axios'
import Link from 'next/link';
import Image from 'next/image';

const ConnectButton = dynamic(() => import('../components/ConnectButton'), {
  ssr: false
})

export default function StoryProtocolPage() {
  const { isConnected, address } = useAppKitAccount()
  const [mounted, setMounted] = useState(false)
  interface Ipa {
    _id: string
    title: string
    ipType?: string
    tokenId?: string
    image?: string
  }

  const [ipaMetadata, setIpaMetadata] = useState<Ipa[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    const fetchIpaMetadata = async () => {
      if (!isConnected || !address) return
      
      setLoading(true)
      try {
        const response = await axios.get(`/api/ipametadata/fetch?wallet=${address}`)
        
        setIpaMetadata(response.data.ipametadata || [])
      } catch (error) {
        console.error('Error fetching IPA metadata:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (isConnected && address) {
      fetchIpaMetadata()
    } else {
      setIpaMetadata([])
    }
  }, [isConnected, address])
  
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
              <h1 className="text-3xl font-bold mb-1 text-white">Story Network Registration</h1>
              <Link 
                href="/story-network" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                More info
              </Link>
            </div>
            <ConnectButton />
          </div>
        </div>
        
        {!isConnected ? (
          <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
            <p>Connect your wallet to register your IP-ready Story Elements with Story Network</p>
          </div>
        ) : loading ? (
          <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p>Loading your IP-ready Story Elements...</p>
            </div>
          </div>
        ) : ipaMetadata.length === 0 ? (
          <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">No IP-ready Story Elements found.</h2>
            <p>If you recently created a Story Element then it is likely still in the refinement pipeline. Please try again soon.</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden p-6">
            <h2 className="text-2xl font-bold mb-6 text-white">Your IP-ready Story Elements</h2>

            <div className="space-y-6">
              {ipaMetadata.map((ipa: Ipa) => (
                <Link href={`/ipametadata/${ipa._id}`} key={ipa._id}>
                  <div className="border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="flex gap-4">
                        {ipa.image && (
                          <div className="flex-shrink-0">
                            <Image
                              src={ipa.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                              alt={ipa.title || 'IPA Thumbnail'}
                              width={80}
                              height={80}
                              className="rounded-md object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold">{ipa.title}</h3>
                          <p className="text-gray-400 mt-1">{ipa.ipType || 'Unknown Type'}</p>
                          {ipa.tokenId && (
                            <p className="text-gray-400 mt-1">Token ID: {ipa.tokenId}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-gray-400 hover:text-gray-300 text-sm">
                        View Details
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Register your Story Elements on Story Network to enable licensing opportunities.</p>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}