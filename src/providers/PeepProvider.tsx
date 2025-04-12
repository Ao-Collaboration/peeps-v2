import {adjectives, names, uniqueNamesGenerator} from 'unique-names-generator'

import {useState} from 'react'

import {PeepMetadata} from '../types/metadata'
import {getDefaultPeep, getRandomPeep} from '../utils/traitUtils'
import {useAuth} from './contexts/AuthContext'
import {PeepContext} from './contexts/PeepContext'

export const PeepProvider = ({children}: {children: React.ReactNode}) => {
  const {traitData} = useAuth()
  const [backgroundHidden, setBackgroundHidden] = useState<boolean>(false)
  const [peep, setPeep] = useState<PeepMetadata>({
    name: '',
    traits: getDefaultPeep(),
    birthday: {day: 1, month: 1},
  })

  const randomizePeep = () => {
    const newTraits = getRandomPeep(traitData)
    const newName = generateRandomName()
    setPeep(prev => ({
      ...prev,
      traits: newTraits,
      name: newName,
    }))
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
        randomizePeep,
        peep,
        setPeep,
        backgroundHidden,
        setBackgroundHidden,
      }}
    >
      {children}
    </PeepContext.Provider>
  )
}
