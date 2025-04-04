import {TraitData, traitsData} from '../data/traits'
import {SKIN_TONES} from './constants'

export interface ImageEntry {
  index: number
  filePath: string
  traitName: string
  skinTone?: string
}

const DEFAULT_IMAGE_ENTRIES: ImageEntry[] = [
  {
    index: 16000,
    filePath: 'Hidden/Eye Whites/Base.svg',
    traitName: 'Eye Whites',
  },
  {
    index: 17000,
    filePath: 'Hidden/Head/Base.svg',
    traitName: 'Head',
  },
]

export const requireTraitByName = (name: string): TraitData => {
  const trait = traitsData.find(trait => trait.name === name)
  if (!trait) {
    throw new Error(`Trait not found: ${name}`)
  }
  return trait
}

export const createImageEntries = (selectedTraits: TraitData[]): ImageEntry[] => {
  const entries = [
    ...DEFAULT_IMAGE_ENTRIES,
    ...selectedTraits.flatMap(trait => {
      if (trait.type === 'Automated') {
        if (trait.label && trait.headerCategory === 'Skin' && trait.secondaryCategory === 'Tone') {
          const skinTone = SKIN_TONES.get(trait.label)
          if (skinTone) {
            return [
              {
                index: 11000,
                filePath: `Hidden/Skin/Basic.svg`,
                traitName: trait.name,
                skinTone,
              },
            ]
          }
        }
      } else {
        const traitEntries: ImageEntry[] = []
        const addEntry = (trait: TraitData, index?: number, fileName?: string) => {
          if (index && fileName) {
            const filePath = [trait.selectionsCategory, trait.headerCategory, trait.name, fileName]
              .filter(Boolean)
              .join('/')
            traitEntries.push({
              index,
              filePath,
              traitName: trait.name,
            })
          }
        }
        addEntry(trait, trait.backIndex, trait.backFile)
        addEntry(trait, trait.frontIndex, trait.frontFile)
        return traitEntries
      }
      console.error(`Unable to process trait: ${trait.name}`, trait)
      return []
    }),
  ]

  return entries.sort((a, b) => a.index - b.index)
}
