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
}

const DownloadButton: React.FC<DownloadButtonProps> = ({svgRef, currentName}) => {
  const {isModalOpen, openModal, closeModal} = useModal()

  const handleDownload = async (format: 'SVG' | 'PNG') => {
    if (!svgRef.current) return
    closeModal('download')
    await downloadSvg(svgRef.current, {}, async () => {}, currentName, format)
  }

  return (
    <>
      <Button onClick={() => openModal('download')} title="Download Peep">
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
