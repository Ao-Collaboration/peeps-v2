import {useRef} from 'react'

import {CanvasContext} from './contexts/CanvasContext'

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
