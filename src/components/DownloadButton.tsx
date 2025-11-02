import React from 'react'

import {faDownload} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import {useModal} from '../providers/contexts/ModalContext'
import {downloadSvg} from '../utils/downloadUtils'
import Button from './Button'
import Modal from './Modal'

interface DownloadButtonProps {
  svgRef: React.RefObject<SVGSVGElement | null>
  currentName?: string
  invert?: boolean
}

const DownloadButton: React.FC<DownloadButtonProps> = ({svgRef, currentName, invert = false}) => {
  const {isModalOpen, openModal, closeModal} = useModal()

  const handleDownload = async (format: 'SVG' | 'PNG') => {
    if (!svgRef.current) return
    closeModal('download')
    // SVG from Canvas already has data URLs, so empty svgContent is fine
    await downloadSvg(svgRef.current, {}, async () => {}, currentName, format)
  }

  return (
    <>
      <Button onClick={() => openModal('download')} title="Download Peep" invert={invert}>
        <FontAwesomeIcon icon={faDownload} />
      </Button>

      {isModalOpen('download') && (
        <Modal title="Select Download Format" onClose={() => closeModal('download')}>
          <div className="w-full flex gap-2 justify-center">
            <Button onClick={() => handleDownload('SVG')} title="Download Peep as SVG">
              SVG
            </Button>
            <Button onClick={() => handleDownload('PNG')} title="Download Peep as PNG">
              PNG
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

export default DownloadButton
