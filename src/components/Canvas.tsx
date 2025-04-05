import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useRef} from 'react'

import {TraitData} from '../data/traits'
import {useSvgLoader} from '../hooks/useSvgLoader'
import {createImageEntries} from '../utils/traitUtils'
import './Canvas.css'

interface CanvasProps {
  selectedTraits: TraitData[]
  currentName?: string
}

export interface CanvasRef {
  download: () => Promise<void>
}

const Canvas = forwardRef<CanvasRef, CanvasProps>(({selectedTraits, currentName}, ref) => {
  const {svgContent, loadSvg} = useSvgLoader()
  const imageEntries = useMemo(() => createImageEntries(selectedTraits), [selectedTraits])
  const svgRef = useRef<SVGSVGElement>(null)

  useImperativeHandle(
    ref,
    () => ({
      download: async () => {
        if (!svgRef.current) return
        const {downloadSvg} = await import('../utils/downloadUtils')
        await downloadSvg(svgRef.current, svgContent, loadSvg, currentName)
      },
    }),
    [currentName, svgContent, loadSvg],
  )

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
          <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 1200"
            preserveAspectRatio="xMidYMid meet"
            className="peep-svg"
          >
            {imageEntries.map((entry, idx) => {
              const svgData = entry.replacements
                ? svgContent[entry.filePath]
                : `/traits/${entry.filePath}`
              return (
                <image
                  key={`${entry.traitName}-${idx}`}
                  href={svgData}
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
