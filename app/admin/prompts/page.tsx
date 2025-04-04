// app/admin/prompts/page.tsx
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

export default function PromptsPage() {
  const router = useRouter()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [promptTypes, setPromptTypes] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    const fetchPrompts = async () => {
      if (!mounted) return
      
      setLoading(true)
      try {
        const response = await axios.get('/api/admin/prompts')
        const data = response.data.prompts || []
        setPrompts(data)
        
        const types = [...new Set(data.map((p: Prompt) => p.type))] as string[]
        setPromptTypes(types)
      } catch (error) {
        console.error('Error fetching prompts:', error)
        setError('Failed to load prompts. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPrompts()
  }, [mounted])
  
  const activatePrompt = async (promptId: string) => {
    try {
      await axios.patch('/api/admin/prompts', {
        promptId
      })
      
      setPrompts(prompts.map(p => ({
        ...p,
        active: p._id === promptId ? true : p.type === prompts.find(x => x._id === promptId)?.type ? false : p.active
      })))
    } catch (error) {
      console.error('Error activating prompt:', error)
      setError('Failed to activate prompt. Please try again.')
    }
  }
  
  const filteredPrompts = prompts
    .filter(p => activeFilter === null || p.active === activeFilter)
    .filter(p => !typeFilter || p.type === typeFilter)
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
      {error && (
        <div className="mb-4 bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-lg">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
          <button 
            onClick={() => setError(null)}
            className="mt-2 px-2 py-1 text-xs bg-red-800 hover:bg-red-700 rounded"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Filters */}
      <div className="mb-6 bg-gray-800/80 rounded-xl p-4 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-1">Prompt Type</label>
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {promptTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              value={activeFilter === null ? '' : activeFilter ? 'active' : 'inactive'}
              onChange={(e) => {
                const val = e.target.value
                setActiveFilter(val === '' ? null : val === 'active')
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-end">
            <button
              onClick={() => {
                setTypeFilter('')
                setActiveFilter(null)
              }}
              className="w-full bg-gray-700 border border-gray-600 hover:bg-gray-600 rounded px-3 py-2 text-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Create New Button - Mobile */}
      <div className="mb-4 md:hidden">
        <button
          onClick={() => router.push('/admin/prompts/new')}
          className="w-full py-3 px-4 rounded bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium transition-colors"
        >
          Create New Prompt
        </button>
      </div>
      
      {/* Prompts List */}
      {loading ? (
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-gray-400">Loading prompts...</p>
          </div>
        </div>
      ) : filteredPrompts.length === 0 ? (
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No Prompts Found</h2>
          <p className="text-gray-400 mb-6">
            {typeFilter || activeFilter !== null ? 
              'No prompts match your current filters.' : 
              'There are no prompts in the system yet.'}
          </p>
          <button
            onClick={() => router.push('/admin/prompts/new')}
            className="py-2 px-4 rounded bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium transition-colors"
          >
            Create Your First Prompt
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Version
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredPrompts.map((prompt) => (
                  <tr key={prompt._id} className={prompt.active ? 'bg-purple-900/10' : 'hover:bg-gray-700/30'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{prompt.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-300">
                        {prompt.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      v{prompt.version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {prompt.active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/30 text-green-300">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-300">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(prompt.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/admin/prompts/${prompt._id}`}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/prompts/edit/${prompt._id}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Edit
                        </Link>
                        {!prompt.active && (
                          <button
                            onClick={() => activatePrompt(prompt._id)}
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            Activate
                          </button>
                        )}
                        <Link
                          href={`/admin/prompts/clone/${prompt._id}`}
                          className="text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          Clone
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}