import React, {useEffect, useMemo} from 'react'

import {TraitData} from '../data/traits'
import {useSvgLoader} from '../hooks/useSvgLoader'
import {createImageEntries} from '../utils/traitUtils'
import './Canvas.css'

interface CanvasProps {
  selectedTraits: TraitData[]
}

const Canvas: React.FC<CanvasProps> = ({selectedTraits}) => {
  const {svgContent, loadSvg} = useSvgLoader()
  const imageEntries = useMemo(() => createImageEntries(selectedTraits), [selectedTraits])

  useEffect(() => {
    // Load SVGs for skin tones
    imageEntries.forEach(entry => {
      if (entry.replacements) {
        loadSvg(entry.filePath, entry.replacements)
      }
    })
  }, [imageEntries, loadSvg])

  return (
    <div className="canvas">
      <div className="canvas-content">
        <div className="canvas-image-container">
          {imageEntries.map((entry, idx) => {
            if (entry.replacements) {
              const svgData = svgContent[entry.filePath]
              if (svgData) {
                return (
                  <div
                    key={`${entry.traitName}-${idx}`}
                    className="trait-wrapper"
                    dangerouslySetInnerHTML={{__html: svgData}}
                  />
                )
              }
            }
            return (
              <img
                key={`${entry.traitName}-${idx}`}
                src={`/traits/${entry.filePath}`}
                alt={`${entry.traitName}`}
                className="trait-image"
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Canvas
