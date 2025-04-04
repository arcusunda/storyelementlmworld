import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { aeneid } from '@story-protocol/core-sdk'

export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'default_project_id'

if (!projectId) {
  console.warn('Reown Project ID is not defined. Please set NEXT_PUBLIC_REOWN_PROJECT_ID in your environment variables.')
}

export const networks = [aeneid]

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig