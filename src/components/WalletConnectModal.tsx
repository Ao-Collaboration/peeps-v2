import React, {useEffect, useState} from 'react'

import {faUpload} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import {useWallet} from '../hooks/useWallet'
import {useModal} from '../providers/contexts/ModalContext'
import {usePeep} from '../providers/contexts/PeepContext'
import {type NFTData, convertPeepToNFTMetadata, fetchUserNFTs} from '../utils/nftUtils'
import Button from './Button'
import Modal from './Modal'

const WalletConnectModal: React.FC = () => {
  const {isModalOpen, closeModal} = useModal()
  const {connectWallet, disconnectWallet, isConnected, connectedAddress} = useWallet()
  const {peep} = usePeep()
  const [nftData, setNftData] = useState<NFTData | null>(null)
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false)
  const [nftError, setNftError] = useState<string | null>(null)

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
    } catch (error) {
      alert('Failed to connect wallet. Please try again.')
    }
  }

  const handleDisconnectWallet = () => {
    disconnectWallet()
    closeModal('walletConnect')
  }

  const handleUpdateNFT = (tokenId: bigint) => {
    try {
      // Find the corresponding NFT to get its image URL
      const nft = nftData?.nfts.find(n => n.tokenId === tokenId)
      const imageUrl = nft?.metadata?.image

      if (!imageUrl) {
        alert('Cannot update NFT: Please ensure the NFT metadata is loaded.')
        return
      }

      // Convert current peep metadata to NFT format
      const nftMetadata = convertPeepToNFTMetadata(peep, imageUrl)

      console.log(`Updating NFT token ${tokenId.toString()} with metadata:`, nftMetadata)

      // TODO: Implement actual blockchain update logic here
      alert(`NFT token ${tokenId.toString()} will be updated with current peep metadata!`)
    } catch (error) {
      console.error('Error converting peep to NFT metadata:', error)
      alert(`Failed to prepare NFT update. Please save your peep and try again. ${error}`)
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
                            <Button onClick={() => handleUpdateNFT(nft.tokenId)} title="Update NFT">
                              <FontAwesomeIcon icon={faUpload} />
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
