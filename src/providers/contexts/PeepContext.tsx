import {createContext, useContext} from 'react'

import {TraitData} from '../../data/traits'

interface PeepContextType {
  selectedTraits: TraitData[]
  currentPeepName: string
  setSelectedTraits: (traits: TraitData[]) => void
  setCurrentPeepName: (name: string) => void
  randomizePeep: () => void
}

export const PeepContext = createContext<PeepContextType | undefined>(undefined)

export const usePeep = () => {
  const context = useContext(PeepContext)
  if (context === undefined) {
    throw new Error('usePeep must be used within a PeepProvider')
  }
  return context
}
