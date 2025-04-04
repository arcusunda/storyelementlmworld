'use client'

import { useAppKitAccount } from '@reown/appkit/react'
import React, { useEffect } from 'react'

export default function ConnectButton() {
  const { isConnected, address } = useAppKitAccount()
  
  useEffect(() => {
    console.log('ConnectButton mounted')
    console.log('Is connected:', isConnected)
    console.log('Address:', address)
    
    console.log('appkit-button defined:', typeof customElements.get('appkit-button') !== 'undefined')
  }, [isConnected, address])

  return (
    <div className="flex items-center gap-2">
      <div className="appkit-button-container">
        <appkit-button size="sm" />
      </div>
    </div>
  )
}