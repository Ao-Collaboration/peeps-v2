import {forwardRef, useEffect, useMemo, useState} from 'react'

import {TraitData} from '../data/traits'
import {useSvgLoader} from '../hooks/useSvgLoader'
import {createImageEntries} from '../utils/traitUtils'
import './Canvas.css'

interface CanvasProps {
  selectedTraits: TraitData[]
}

const Canvas = forwardRef<SVGSVGElement, CanvasProps>(({selectedTraits}, ref) => {
  const {svgContent, loadSvg} = useSvgLoader()
  const [loadingTraits, setLoadingTraits] = useState<string[]>([])
  const imageEntries = useMemo(() => createImageEntries(selectedTraits), [selectedTraits])

  useEffect(() => {
    const traitsToLoad = imageEntries
      .filter(entry => !svgContent[entry.filePath])
      .filter(entry => entry.trait)
      .map(entry => entry.trait!.name)

    setLoadingTraits(traitsToLoad)

    // Load all SVGs into cache
    const loadPromises = imageEntries.map(entry => {
      return loadSvg(entry.filePath, entry.replacements).then(() => {
        setLoadingTraits(prev => prev.filter(trait => trait !== entry.trait?.name))
      })
    })

    Promise.all(loadPromises).finally(() => {
      setLoadingTraits([])
    })
  }, [imageEntries, loadSvg, svgContent])

  const isLoading = loadingTraits.length > 0

  return (
    <div className="canvas">
      <div className="canvas-content">
        <div className="canvas-image-container">
          {isLoading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <div className="loading-text">
                Loading traits:
                <ul className="loading-traits">
                  {loadingTraits.map(trait => (
                    <li key={trait}>{trait}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 1200"
            preserveAspectRatio="xMidYMid meet"
            className="peep-svg"
            style={{opacity: isLoading ? 0.2 : 1}}
          >
            {imageEntries.map((entry, idx) => {
              return (
                <image
                  key={`${entry.trait?.name ?? 'static'}-${idx}`}
                  href={svgContent[entry.filePath]}
                  x="0"
                  y="0"
                  width="1200"
                  height="1200"
                  preserveAspectRatio="xMidYMid meet"
                  style={{zIndex: idx}}
                />
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
})

Canvas.displayName = 'Canvas'

export default Canvas
