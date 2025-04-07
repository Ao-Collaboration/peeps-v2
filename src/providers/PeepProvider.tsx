import {adjectives, names, uniqueNamesGenerator} from 'unique-names-generator'

import {useState} from 'react'

import {TraitData} from '../data/traits'
import {getDefaultPeep, getRandomPeep} from '../utils/traitUtils'
import {useAuth} from './contexts/AuthContext'
import {PeepContext} from './contexts/PeepContext'

export const PeepProvider = ({children}: {children: React.ReactNode}) => {
  const {traitData} = useAuth()
  const [selectedTraits, setSelectedTraits] = useState<TraitData[]>(getDefaultPeep())
  const [currentPeepName, setCurrentPeepName] = useState<string>('')

  const randomizePeep = () => {
    setSelectedTraits(getRandomPeep(traitData))
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
