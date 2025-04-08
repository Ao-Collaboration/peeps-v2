import React, {useState} from 'react'

import {faDownload} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import {downloadSvg} from '../utils/downloadUtils'
import Button from './Button'

interface DownloadButtonProps {
  svgRef: React.RefObject<SVGSVGElement | null>
  currentName?: string
}

const DownloadButton: React.FC<DownloadButtonProps> = ({svgRef, currentName}) => {
  const [showFormatDialog, setShowFormatDialog] = useState(false)

  const handleDownload = async (format: 'SVG' | 'PNG') => {
    if (!svgRef.current) return
    setShowFormatDialog(false)
    await downloadSvg(svgRef.current, {}, async () => {}, currentName, format)
  }

  return (
    <>
      <Button onClick={() => setShowFormatDialog(true)} title="Download Peep">
        <FontAwesomeIcon icon={faDownload} />
      </Button>

      {showFormatDialog && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-black/70 z-50">
          <div className="bg-white p-4 rounded-lg flex flex-col gap-4 items-center">
            <h3 className="text-lg font-bold">Select Download Format</h3>
            <div className="flex gap-2">
              <Button onClick={() => handleDownload('SVG')} title="Download Peep as SVG">
                SVG
              </Button>
              <Button onClick={() => handleDownload('PNG')} title="Download Peep as PNG">
                PNG
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DownloadButton
