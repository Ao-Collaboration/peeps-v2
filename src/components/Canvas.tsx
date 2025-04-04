import React, {useEffect} from 'react'

import {TraitData} from '../data/traits'
import {useSvgLoader} from '../hooks/useSvgLoader'
import {SKIN_TONE_DEFAULT} from '../utils/constants'
import {createImageEntries} from '../utils/traitUtils'
import './Canvas.css'

interface CanvasProps {
  selectedTraits: TraitData[]
}

const Canvas: React.FC<CanvasProps> = ({selectedTraits}) => {
  const {svgContent, loadSvg} = useSvgLoader()
  const imageEntries = createImageEntries(selectedTraits)

  useEffect(() => {
    // Load SVGs for skin tones
    imageEntries.forEach(entry => {
      if (entry.skinTone) {
        loadSvg(entry.filePath, {
          currentFill: SKIN_TONE_DEFAULT,
          replacementFill: entry.skinTone,
        })
      }
    })
  }, [imageEntries, loadSvg])

  return (
    <div className="canvas">
      <div className="canvas-content">
        <div className="canvas-image-container">
          {imageEntries.map((entry, idx) => {
            if (entry.skinTone) {
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
        <div className="traits-list">
          <h2>Selected Traits</h2>
          {selectedTraits.length === 0 ? (
            <p className="empty-message">No traits selected</p>
          ) : (
            <ul className="selected-traits-list">
              {selectedTraits.map(trait => (
                <li key={trait.name} className="selected-trait-item">
                  {trait.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default Canvas
