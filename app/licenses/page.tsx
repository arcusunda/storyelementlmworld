// app/licenses/page.tsx
"use client"

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAppKitAccount } from '@reown/appkit/react'
import axios from 'axios'
import Link from 'next/link'
import Image from 'next/image'

const ConnectButton = dynamic(() => import('../components/ConnectButton'), {
  ssr: false
})

export default function LicenseablePage() {
  const { isConnected } = useAppKitAccount()
  const [mounted, setMounted] = useState(false)
  
  interface Ipa {
    _id: string
    title: string
    ipType?: string
    tokenId?: string
    storyProtocolIpId?: string
    licenseTermsIds?: string
    image?: string
  }

  const [registeredIpas, setRegisteredIpas] = useState<Ipa[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    const fetchRegisteredIpas = async () => {
      setLoading(true)
      try {
        const response = await axios.get('/api/licenses/fetchRegistered')
        setRegisteredIpas(response.data.ipametadata || [])
      } catch (error) {
        console.error('Error fetching registered IPAs:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (mounted) {
      fetchRegisteredIpas()
    }
  }, [mounted])
  
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
            <h1 className="text-3xl font-bold mb-4 md:mb-0 text-white">Licenseable IP Assets</h1>
            <ConnectButton />
          </div>
        </div>
        
        {!isConnected ? (
          <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
            <p>Connect your wallet to mint license tokens for registered IP assets</p>
          </div>
        ) : loading ? (
          <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p>Loading licenseable IP assets...</p>
            </div>
          </div>
        ) : registeredIpas.length === 0 ? (
          <div className="p-8 text-center bg-gray-800/30 rounded-xl backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">No Registered IP Assets Found</h2>
            <p>There are no IP assets registered with Story Network that can be licensed.</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden p-6">
            <h2 className="text-2xl font-bold mb-6 text-white">Licenseable IP Assets</h2>
            
            <div className="space-y-6">
              {registeredIpas.map((ipa: Ipa) => (
                <Link href={`/licenses/${ipa._id}`} key={ipa._id}>
                  <div className="border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition-colors cursor-pointer">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="flex gap-4">
                        {ipa.image ? (
                          <div className="flex-shrink-0">
                            <Image
                              src={ipa.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                              alt={ipa.title || 'IP Asset Thumbnail'}
                              width={80}
                              height={80}
                              className="rounded-md object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-20 h-20 bg-gray-700 rounded-md flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
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
                      
                      <div className="mt-2 md:mt-0 ml-0 md:ml-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-900 text-purple-200">
                          Licenseable
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-gray-400 hover:text-gray-300 text-sm">
                        View License Details
                      </span>
                      
                      <span className="text-purple-400 text-sm font-medium">
                        License Terms: {ipa.licenseTermsIds || 'Available'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Mint license tokens to use the registered IP assets commercially or create derivatives based on the license terms.</p>
          <p className="mt-2 text-blue-400 text-xs">Note: All transactions occur on the Aeneid Testnet for demonstration purposes only.</p>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}