import {createContext, useContext} from 'react'

import {TraitData} from '../../data/traits'

interface PeepContextType {
  randomizePeep: () => void
  selectedTraits: TraitData[]
  setSelectedTraits: (traits: TraitData[]) => void
  currentPeepName: string
  setCurrentPeepName: (name: string) => void
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
