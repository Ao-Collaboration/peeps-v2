import React from 'react'
import {TraitData} from '../data/traits'
import './Canvas.css'

interface CanvasProps {
  selectedTraits: TraitData[]
}

const Canvas: React.FC<CanvasProps> = ({selectedTraits}) => {
  return (
    <div className="canvas">
      <div className="canvas-content">
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
  )
}

export default Canvas
