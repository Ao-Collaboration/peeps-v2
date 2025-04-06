import React, {useState} from 'react'

import {faDownload} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import {downloadSvg} from '../utils/downloadUtils'
import './DownloadButton.css'

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
      <button
        className="download-button"
        onClick={() => setShowFormatDialog(true)}
        title="Download Peep"
      >
        <FontAwesomeIcon icon={faDownload} />
      </button>

      {showFormatDialog && (
        <div className="format-dialog-overlay">
          <div className="format-dialog">
            <h3>Select Download Format</h3>
            <div className="format-buttons">
              <button className="format-button" onClick={() => handleDownload('SVG')}>
                SVG
              </button>
              <button className="format-button" onClick={() => handleDownload('PNG')}>
                PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DownloadButton
