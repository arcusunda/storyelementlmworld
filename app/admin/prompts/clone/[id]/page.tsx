// app/admin/prompts/clone/[id]/page.tsx
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

export default function ClonePromptPage() {
  const params = useParams()
  const router = useRouter()
  const [sourcePrompt, setSourcePrompt] = useState<Prompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  
  const [type, setType] = useState('')
  const [name, setName] = useState('')
  const [systemContext, setSystemContext] = useState('')
  const [contentTemplate, setContentTemplate] = useState('')
  const [setActive, setSetActive] = useState(false)
  
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
          const promptData = response.data.prompts[0]
          setSourcePrompt(promptData)
          
          setType(promptData.type)
          setName(`${promptData.name} (Clone)`)
          setSystemContext(promptData.systemContext)
          setContentTemplate(promptData.contentTemplate)
          setSetActive(false)
        } else {
          setError('Source prompt not found')
        }
      } catch (error) {
        console.error('Error fetching prompt:', error)
        setError('Failed to load source prompt')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPrompt()
  }, [id, mounted])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setSaving(true)
    setError(null)
    
    try {
      const response = await axios.post('/api/admin/prompts', {
        type,
        name,
        systemContext,
        contentTemplate,
        setActive
      })
      
      if (response.data.success) {
        router.push('/admin/prompts')
      } else {
        throw new Error(response.data.error || 'Unknown error occurred')
      }
    } catch (error) {
      console.error('Error creating prompt clone:', error)
      setError(error instanceof Error ? error.message : 'Failed to create prompt clone')
    } finally {
      setSaving(false)
    }
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
          Back
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-lg">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}
      
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Clone Prompt</h2>
          <p className="mt-1 text-gray-400">Create a new prompt based on an existing one.</p>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-gray-400">Loading source prompt...</p>
            </div>
          </div>
        ) : sourcePrompt ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="p-4 bg-blue-900/20 border border-blue-700/40 rounded-lg">
              <h3 className="text-sm font-medium text-blue-400 mb-2">
                Source Prompt Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
                <div>
                  <p><strong>Name:</strong> {sourcePrompt.name}</p>
                  <p><strong>Type:</strong> {sourcePrompt.type}</p>
                  <p><strong>Version:</strong> {sourcePrompt.version}</p>
                </div>
                <div>
                  <p><strong>Status:</strong> {sourcePrompt.active ? 'Active' : 'Inactive'}</p>
                  <p><strong>Created:</strong> {new Date(sourcePrompt.createdAt).toLocaleDateString()}</p>
                  <p><strong>Last Updated:</strong> {new Date(sourcePrompt.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">
                  Prompt Type: <span className="text-red-400">*</span>
                </label>
                <input
                  id="type"
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="e.g., backstory, character, scene"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  New Prompt Name: <span className="text-red-400">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Character Backstory Generator v2"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="systemContext" className="block text-sm font-medium text-gray-300 mb-1">
                System Context: <span className="text-red-400">*</span>
              </label>
              <textarea
                id="systemContext"
                value={systemContext}
                onChange={(e) => setSystemContext(e.target.value)}
                required
                rows={12}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                This is the full context given to the AI model to guide its responses.
              </p>
            </div>
            
            <div>
              <label htmlFor="contentTemplate" className="block text-sm font-medium text-gray-300 mb-1">
                Content Template: <span className="text-red-400">*</span>
              </label>
              <textarea
                id="contentTemplate"
                value={contentTemplate}
                onChange={(e) => setContentTemplate(e.target.value)}
                required
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use {"{{placeholders}}"} for dynamic content (e.g., {"{{characterName}}" }).
                This is the specific request that will be sent to the AI.
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                id="setActive"
                type="checkbox"
                checked={setActive}
                onChange={(e) => setSetActive(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="setActive" className="ml-2 block text-sm text-gray-300">
                Set as active prompt for this type
              </label>
              <p className="ml-2 text-xs text-gray-500">
                (Will deactivate any existing active prompts of the same type)
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
              <Link
                href="/admin/prompts"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors ${
                  saving ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Clone...
                  </span>
                ) : 'Create Clone'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center">
            <p className="text-red-400">Source prompt not found</p>
            <Link
              href="/admin/prompts"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Return to Prompts
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}