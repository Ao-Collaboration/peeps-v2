/**
 * Chain switching utilities for wallet operations
 */

// Helper function to switch to Ethereum Mainnet
export const switchToMainnet = async (): Promise<void> => {
  if (!window.ethereum) {
    throw new Error(
      'Wallet not available for chain switching. Please ensure your wallet is connected.',
    )
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{chainId: '0x1'}], // 0x1 is chain ID 1 in hex
    })

    // Wait a moment for the chain switch to complete
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (switchError: unknown) {
    // This error code indicates that the chain has not been added to MetaMask
    if ((switchError as {code?: number}).code === 4902) {
      // Add Ethereum Mainnet to MetaMask if it's not already added
      await addEthereumChain()
    } else {
      throw new Error(
        `Failed to switch to Ethereum Mainnet. Please switch manually. Error: ${(switchError as Error).message}`,
      )
    }
  }
}

// Helper function to add Ethereum Mainnet to wallet
export const addEthereumChain = async (): Promise<void> => {
  if (!window.ethereum) {
    throw new Error(
      'Wallet not available for adding chains. Please ensure your wallet is connected.',
    )
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x1',
          chainName: 'Ethereum Mainnet',
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://eth.llamarpc.com'],
          blockExplorerUrls: ['https://etherscan.io'],
        },
      ],
    })

    // Wait for chain addition and switch
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (addError: unknown) {
    throw new Error(
      `Failed to add Ethereum Mainnet to wallet. Please add it manually. Error: ${(addError as Error).message}`,
    )
  }
}
