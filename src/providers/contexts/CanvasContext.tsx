import {createContext, useContext} from 'react'

interface CanvasContextType {
  canvasRef: React.RefObject<SVGSVGElement | null>
}

export const CanvasContext = createContext<CanvasContextType | undefined>(undefined)

export const useCanvas = () => {
  const context = useContext(CanvasContext)
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider')
  }
  return context
}
