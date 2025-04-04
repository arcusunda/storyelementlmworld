// app/admin/prompts/[id]/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

interface Prompt {
  _id: string
  type: string
  version: string
  active: boolean
  name: string
  systemContext: string
  contentTemplate: string
  createdAt: string
  updatedAt: string
}

export default function PromptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activating, setActivating] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    const fetchPrompt = async () => {
      if (!id || !mounted) return
      
      setLoading(true)
      try {
        const response = await axios.get(`/api/admin/prompts?id=${id}`)
        if (response.data.prompts && response.data.prompts.length > 0) {
          setPrompt(response.data.prompts[0])
        } else {
          setError('Prompt not found')
        }
      } catch (error) {
        console.error('Error fetching prompt:', error)
        setError('Failed to load prompt details')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPrompt()
  }, [id, mounted])
  
  const activatePrompt = async () => {
    if (!prompt || prompt.active) return
    
    setActivating(true)
    try {
      await axios.patch('/api/admin/prompts', {
        promptId: prompt._id
      })
      
      setPrompt({
        ...prompt,
        active: true
      })
    } catch (error) {
      console.error('Error activating prompt:', error)
      setError('Failed to activate prompt')
    } finally {
      setActivating(false)
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (!mounted) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg animate-pulse">
        <div className="h-8 w-64 bg-gray-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
      </div>
    )
  }
  
  return (
    <div>
      {/* Back Button */}
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Prompts
        </button>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-lg">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
          <button 
            onClick={() => router.push('/admin/prompts')}
            className="mt-2 px-2 py-1 text-xs bg-blue-800 hover:bg-blue-700 rounded"
          >
            Return to Prompts List
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-gray-400">Loading prompt details...</p>
          </div>
        </div>
      ) : prompt ? (
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">{prompt.name}</h2>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-300">
                    {prompt.type}
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-300">
                    v{prompt.version}
                  </span>
                  {prompt.active ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-900/30 text-green-300">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-300">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/admin/prompts/edit/${prompt._id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Edit Prompt
                </Link>
                {!prompt.active && (
                  <button
                    onClick={activatePrompt}
                    disabled={activating}
                    className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors ${activating ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {activating ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Activating
                      </span>
                    ) : 'Set as Active'}
                  </button>
                )}
                <Link
                  href={`/admin/prompts/clone/${prompt._id}`}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors"
                >
                  Clone
                </Link>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
              <div>Created: {formatDate(prompt.createdAt)}</div>
              <div>Last Updated: {formatDate(prompt.updatedAt)}</div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-purple-300">System Context</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                  {prompt.systemContext}
                </pre>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-purple-300">Content Template</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-48">
                <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                  {prompt.contentTemplate}
                </pre>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <span className="text-blue-400">Note:</span> Template uses {'{placeholders}'} that are replaced with dynamic content during generation.
              </div>
            </div>
            
            <div className="mt-8 border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Other Versions</h3>
              <div className="text-sm text-gray-400">
                <p>Coming soon: Version history and comparison.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}