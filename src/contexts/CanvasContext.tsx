import {createContext, useContext, useRef} from 'react'

interface CanvasContextType {
  canvasRef: React.RefObject<SVGSVGElement | null>
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined)

export const CanvasProvider = ({children}: {children: React.ReactNode}) => {
  const canvasRef = useRef<SVGSVGElement>(null)

  return (
    <CanvasContext.Provider
      value={{
        canvasRef,
      }}
    >
      {children}
    </CanvasContext.Provider>
  )
}

export const useCanvas = () => {
  const context = useContext(CanvasContext)
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider')
  }
  return context
}
