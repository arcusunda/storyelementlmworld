// app/assets/page.tsx
"use client"

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import MuertoViewer from '../components/MuertoViewer'
import Header from '../components/Header'
import Footer from '../components/Footer'

const ConnectButton = dynamic(() => import('../components/ConnectButton'), {
  ssr: false
})

export default function AssetsPage() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
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
        <div className="mb-8 bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-3xl font-bold mb-4 md:mb-0 text-white">Your Muertos</h1>
            <ConnectButton />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden p-6">
          <MuertoViewer />
        </div>
        
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>View and explore your Muertos. Connect your wallet to get started.</p>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}