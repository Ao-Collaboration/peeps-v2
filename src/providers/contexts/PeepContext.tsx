import {createContext, useContext} from 'react'

import {PeepMetadata} from '../../types/metadata'

interface PeepContextType {
  randomizePeep: () => void
  peep: PeepMetadata
  setPeep: (peep: PeepMetadata) => void
  backgroundHidden: boolean
  setBackgroundHidden: (hidden: boolean) => void
}

export const PeepContext = createContext<PeepContextType | undefined>(undefined)

export const usePeep = () => {
  const context = useContext(PeepContext)
  if (context === undefined) {
    throw new Error('usePeep must be used within a PeepProvider')
  }
  return context
}
