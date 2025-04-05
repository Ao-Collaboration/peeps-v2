import React, {useEffect, useMemo, useRef} from 'react'

import {TraitData} from '../data/traits'
import {useSvgLoader} from '../hooks/useSvgLoader'
import {createImageEntries} from '../utils/traitUtils'
import './Canvas.css'

interface CanvasProps {
  selectedTraits: TraitData[]
  onDownload?: () => void
  currentName?: string
}

const Canvas: React.FC<CanvasProps> = ({selectedTraits, onDownload, currentName}) => {
  const {svgContent, loadSvg} = useSvgLoader()
  const imageEntries = useMemo(() => createImageEntries(selectedTraits), [selectedTraits])
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    // Load SVGs for skin tones
    imageEntries.forEach(entry => {
      if (entry.replacements) {
        loadSvg(entry.filePath, entry.replacements)
      }
    })
  }, [imageEntries, loadSvg])

  const handleDownload = async () => {
    if (!svgRef.current) return

    // Clone the SVG element
    const svg = svgRef.current.cloneNode(true) as SVGSVGElement

    // Update the image hrefs to use data URLs
    const images = Array.from(svg.querySelectorAll('image'))
    for (const image of images) {
      const href = image.getAttribute('href')
      if (!href) continue

      try {
        let url = href
        if (!href.startsWith('data:')) {
          // For non-data URLs, we need to fetch the content
          if (href.startsWith('/')) {
            // Convert relative paths to absolute URLs
            url = window.location.origin + href
          }
          const response = await fetch(url)
          const blob = await response.blob()
          const reader = new FileReader()
          const dataUrl = await new Promise<string>(resolve => {
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })
          image.setAttribute('href', dataUrl)
        }
      } catch (error) {
        console.error('Error converting image URL to data URL:', error)
      }
    }

    // Serialize and download the SVG
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], {type: 'image/svg+xml'})
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentName ? currentName + '_' : ''}Peep.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (onDownload) {
      handleDownload()
    }
  }, [onDownload])

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
}

export default Canvas
