import {type Address, type WalletClient, createWalletClient, custom} from 'viem'
import {mainnet} from 'viem/chains'

import React, {useCallback, useState} from 'react'

import '../types/wallet'
import {switchToMainnet} from '../utils/chainUtils'
import {WalletContext, type WalletContextType} from './contexts/WalletContext'

export const WalletProvider = ({children}: {children: React.ReactNode}) => {
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)
  const [connectedAddress, setConnectedAddress] = useState<Address | null>(null)
  const [isWalletAvailable, setIsWalletAvailable] = useState<boolean>(false)

  // Check if wallet is available on mount
  React.useEffect(() => {
    setIsWalletAvailable(!!window.ethereum)
  }, [])

  const connectWallet = useCallback(async () => {
    try {
      // Check if wallet is available
      if (!window.ethereum) {
        throw new Error('No wallet detected. Please install MetaMask or another Ethereum wallet.')
      }

      // Request account access
      await window.ethereum.request({method: 'eth_requestAccounts'})

      // Switch to Ethereum Mainnet (chain ID 1)
      await switchToMainnet()

      // Create wallet client
      const client = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum),
      })

      // Get the connected account
      const accounts = await client.getAddresses()
      const address = accounts[0]

      if (!address) {
        throw new Error('No accounts found')
      }

      setWalletClient(client)
      setConnectedAddress(address)
      console.log(`Connected wallet ${address} on Ethereum Mainnet`)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setWalletClient(null)
    setConnectedAddress(null)
  }, [])

  const value: WalletContextType = {
    walletClient,
    connectedAddress,
    isConnected: !!connectedAddress,
    isWalletAvailable,
    connectWallet,
    disconnectWallet,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
