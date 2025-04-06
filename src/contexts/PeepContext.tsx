import {adjectives, names, uniqueNamesGenerator} from 'unique-names-generator'

import {createContext, useContext, useState} from 'react'

import {TraitData} from '../data/traits'
import {getDefaultPeep, getRandomPeep} from '../utils/traitUtils'

interface PeepContextType {
  selectedTraits: TraitData[]
  currentPeepName: string
  setSelectedTraits: (traits: TraitData[]) => void
  setCurrentPeepName: (name: string) => void
  randomizePeep: () => void
}

const PeepContext = createContext<PeepContextType | undefined>(undefined)

export const PeepProvider = ({children}: {children: React.ReactNode}) => {
  const [selectedTraits, setSelectedTraits] = useState<TraitData[]>(getDefaultPeep())
  const [currentPeepName, setCurrentPeepName] = useState<string>('')

  const randomizePeep = () => {
    setSelectedTraits(getRandomPeep())
    setCurrentPeepName(generateRandomName())
  }

  const generateRandomName = () => {
    return uniqueNamesGenerator({
      dictionaries: [adjectives, names],
      separator: ' ',
      style: 'capital',
      length: 2,
    })
  }

  return (
    <PeepContext.Provider
      value={{
        selectedTraits,
        currentPeepName,
        setSelectedTraits,
        setCurrentPeepName,
        randomizePeep,
      }}
    >
      {children}
    </PeepContext.Provider>
  )
}

export const usePeep = () => {
  const context = useContext(PeepContext)
  if (context === undefined) {
    throw new Error('usePeep must be used within a PeepProvider')
  }
  return context
}
