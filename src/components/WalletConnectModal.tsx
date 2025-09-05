import React, {useEffect, useState} from 'react'

import {faUpload} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import {useWallet} from '../hooks/useWallet'
import {useCanvas} from '../providers/contexts/CanvasContext'
import {useModal} from '../providers/contexts/ModalContext'
import {usePeep} from '../providers/contexts/PeepContext'
import {switchToMainnet} from '../utils/chainUtils'
import {getSvgPngHash} from '../utils/imageHashUtils'
import {
  type NFTData,
  convertPeepToNFTMetadata,
  fetchUserNFTs,
  getUpdateTypedData,
} from '../utils/nftUtils'
import Button from './Button'
import Modal from './Modal'

const WalletConnectModal: React.FC = () => {
  const {isModalOpen, closeModal} = useModal()
  const {connectWallet, disconnectWallet, isConnected, connectedAddress, walletClient} = useWallet()
  const {peep} = usePeep()
  const {canvasRef} = useCanvas()
  const [nftData, setNftData] = useState<NFTData | null>(null)
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false)
  const [nftError, setNftError] = useState<string | null>(null)
  const [isUpdatingNFT, setIsUpdatingNFT] = useState<bigint | null>(null)

  const isOpen = isModalOpen('walletConnect')

  // Fetch NFTs when wallet connects
  useEffect(() => {
    if (isConnected && connectedAddress) {
      setIsLoadingNFTs(true)
      setNftError(null)
      setNftData(null)

      fetchUserNFTs(connectedAddress)
        .then(data => {
          setNftData(data)
          setIsLoadingNFTs(false)
        })
        .catch(error => {
          setNftError(error.message)
          setIsLoadingNFTs(false)
        })
    } else {
      setNftData(null)
      setNftError(null)
    }
  }, [isConnected, connectedAddress])

  const handleConnectWallet = async () => {
    try {
      await connectWallet()
      // Don't auto-close modal when connected
    } catch {
      alert('Failed to connect wallet. Please try again.')
    }
  }

  const handleDisconnectWallet = () => {
    disconnectWallet()
    closeModal('walletConnect')
  }

  const handleUpdateNFT = async (tokenId: bigint) => {
    if (!walletClient) {
      alert('Wallet not connected. Please connect your wallet first.')
      return
    }

    try {
      setIsUpdatingNFT(tokenId)

      // Check if we're on mainnet (chainId 1), if not, try to switch
      let chainId = walletClient.chain?.id
      if (chainId !== 1) {
        await switchToMainnet()

        // Re-check the chain ID after switching
        chainId = walletClient.chain?.id
        if (chainId !== 1) {
          throw new Error(
            `Failed to switch to Ethereum Mainnet. Current chain ID: ${chainId}. Please manually switch to Mainnet.`,
          )
        }
      }

      // Get the SVG element from canvas
      if (!canvasRef.current) {
        throw new Error('Canvas not available. Please ensure the peep is loaded.')
      }

      // Get the PNG hash from the current SVG
      const imageHash = await getSvgPngHash(canvasRef.current, peep.name)

      // Find the corresponding NFT to get its image URL for metadata
      const nft = nftData?.nfts.find(n => n.tokenId === tokenId)
      const imageUrl = nft?.metadata?.image

      if (!imageUrl) {
        throw new Error('Cannot update NFT: Please ensure the NFT metadata is loaded.')
      }

      // Convert current peep metadata to NFT format
      const nftMetadata = convertPeepToNFTMetadata(peep, imageUrl)

      console.log(`Updating NFT token ${tokenId.toString()} with metadata:`, nftMetadata)
      console.log(`Image hash: ${imageHash}`)

      // Create the typed data for signing
      const typedData = getUpdateTypedData(tokenId, nftMetadata, imageHash, chainId)

      console.log('Typed data for signing:', typedData)

      // Sign the typed data with the connected wallet
      const signature = await walletClient.signTypedData({
        domain: typedData.domain,
        types: typedData.types,
        primaryType: typedData.primaryType as 'UpdatePeep',
        message: typedData.message,
        account: connectedAddress!,
      })

      console.log('Signature received:', signature)

      // TODO: Send the signature and metadata to your backend/contract
      // For now, we'll just show a success message
      alert(
        `NFT token ${tokenId.toString()} update signed successfully!\n\nSignature: ${signature}\n\nThis signature can now be sent to your backend for processing.`,
      )
    } catch (error) {
      console.error('Error updating NFT:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to update NFT: ${errorMessage}`)
    } finally {
      setIsUpdatingNFT(null)
    }
  }

  const handleCancel = () => {
    closeModal('walletConnect')
  }

  if (!isOpen) return null

  return (
    <Modal title="Wallet" onClose={handleCancel} data-modal="walletConnect">
      <div className="space-y-4">
        {isConnected ? (
          <>
            <div className="space-y-2">
              <p className="text-gray-700">Connected to Ethereum with:</p>
              <div className="p-3 bg-gray-100 rounded-md">
                <p className="text-sm font-mono text-gray-800 break-all">{connectedAddress}</p>
              </div>
            </div>

            {/* NFT Data Section */}
            <hr className="border-gray-200 my-4" />
            <div className="flex flex-col gap-4 mb-4">
              <h3 className="text-md font-bold text-gray-600">Your NFTs</h3>
              {isLoadingNFTs ? (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">Loading NFT data...</p>
                </div>
              ) : nftError ? (
                <div className="p-3 bg-red-50 rounded-md">
                  <p className="text-sm text-red-700">Error: {nftError}</p>
                </div>
              ) : nftData ? (
                <div className="space-y-2">
                  {nftData.nfts.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {nftData.nfts.map((nft, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center gap-4 py-2 px-4 rounded-lg bg-gray-50 border border-gray-200"
                        >
                          <div className="flex flex-col flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-mono text-gray-600">
                                #{nft.tokenId.toString()}{' '}
                                {nft.metadata?.name ? `- ${nft.metadata.name}` : ''}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleUpdateNFT(nft.tokenId)}
                              title="Update NFT"
                              disabled={isUpdatingNFT === nft.tokenId}
                            >
                              {isUpdatingNFT === nft.tokenId ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Signing...</span>
                                </div>
                              ) : (
                                <FontAwesomeIcon icon={faUpload} />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600">No Peeps found.</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <div className="flex gap-3 justify-end">
              <Button onClick={handleDisconnectWallet} title="Disconnect" type="error">
                Disconnect Wallet
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-700">Have a eep on Ethereum? Connect your wallet to update!</p>
            <div className="flex gap-3 justify-end">
              <Button onClick={handleConnectWallet} title="Connect Wallet">
                Connect Wallet
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default WalletConnectModal
