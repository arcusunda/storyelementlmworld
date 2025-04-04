'use client'

import { wagmiAdapter, projectId } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import React, { type ReactNode, useState, useEffect } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { aeneid } from '@story-protocol/core-sdk'

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const [queryClient] = useState(() => new QueryClient())
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const metadata = {
        name: 'Story Element for Los Muertos World',
        description: 'AI-powered storytelling platform for Los Muertos World',
        url: 'https://storyelement.ai',
        icons: ['https://storyelement.ai/favicon.ico']
      }
      
      createAppKit({
        adapters: [wagmiAdapter],
        projectId,
        networks: [aeneid],
        defaultNetwork: aeneid,
        metadata: metadata,
        features: {
          analytics: true,
        }
      })
    }
  }, [])
  
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider