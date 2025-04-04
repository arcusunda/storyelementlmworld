// app/admin/prompts/layout.tsx
"use client"

import React from 'react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function PromptAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-8 bg-gray-800/80 border border-blue-500/30 rounded-xl p-4 shadow-lg">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-blue-400">Admin Area</span>
          </div>
          <p className="text-gray-300">
            Manage system prompts for the AI-generated content. Changes here will affect all future content generation.
          </p>
        </div>
        
        <div className="mb-8 bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-3xl font-bold mb-4 md:mb-0 text-white">Prompt Management</h1>
            
            <div className="flex space-x-2">
              <Link 
                href="/admin/prompts" 
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/admin/prompts') 
                    ? 'bg-purple-700 text-white' 
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                All Prompts
              </Link>
              <Link 
                href="/admin/prompts/new" 
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/admin/prompts/new') 
                    ? 'bg-purple-700 text-white' 
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                Create New
              </Link>
            </div>
          </div>
        </div>
        
        {children}
      </div>
      
      <Footer />
    </div>
  )
}