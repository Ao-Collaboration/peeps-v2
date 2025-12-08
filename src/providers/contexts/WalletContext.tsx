import {type Address, type WalletClient} from 'viem'

import {createContext} from 'react'

export interface WalletContextType {
  walletClient: WalletClient | null
  connectedAddress: Address | null
  isConnected: boolean
  isWalletAvailable: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined)
