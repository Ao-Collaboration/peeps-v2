import React from 'react'

import {SKIN_TONES} from '../data/constants'
import {TraitData} from '../data/traits'
import './Canvas.css'

interface CanvasProps {
  selectedTraits: TraitData[]
}

interface ImageEntry {
  index: number
  filePath: string
  traitName: string
}

const DEFAULT_IMAGE_ENTRIES: ImageEntry[] = [
  {
    index: 16000,
    filePath: 'Hidden/Eye Whites/Base.svg',
    traitName: 'Eye Whites',
  },
  {
    index: 17000,
    filePath: 'Hidden/Head/Base.svg',
    traitName: 'Head',
  },
]

const Canvas: React.FC<CanvasProps> = ({selectedTraits}) => {
  // Create a flat list of all images with their indices
  const imageEntries: ImageEntry[] = [
    ...DEFAULT_IMAGE_ENTRIES,
    ...selectedTraits.flatMap(trait => {
      if (trait.type === 'Automated') {
        // Custom logic for automated traits
        if (trait.label && trait.headerCategory === 'Skin' && trait.secondaryCategory === 'Tone') {
          const skinTone = SKIN_TONES.get(trait.label)
          if (skinTone) {
            //FIXME We need to do something here to apply the colour
            return [
              {
                index: 11000,
                filePath: `Hidden/Skin/Basic.svg`,
                traitName: trait.name,
              },
            ]
          }
        }
      } else {
        const entries: ImageEntry[] = []
        const addEntry = (trait: TraitData, index?: number, fileName?: string) => {
          if (index && fileName) {
            const filePath = [trait.selectionsCategory, trait.headerCategory, trait.name, fileName]
              .filter(Boolean)
              .join('/')
            entries.push({
              index,
              filePath,
              traitName: trait.name,
            })
          }
        }
        addEntry(trait, trait.backIndex, trait.backFileName)
        addEntry(trait, trait.frontIndex, trait.frontFileName)
        return entries
      }
      console.error(`Unable to process trait: ${trait.name}`, trait)
      return []
    }),
  ]

  // Sort by index
  const sortedImages = imageEntries.sort((a, b) => a.index - b.index)

  return (
    <div className="canvas">
      <div className="canvas-content">
        <div className="canvas-image-container">
          {sortedImages.map((entry, idx) => (
            <img
              key={`${entry.traitName}-${idx}`}
              src={`/traits/${entry.filePath}`}
              alt={`${entry.traitName}`}
              className={`trait-image`}
            />
          ))}
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
