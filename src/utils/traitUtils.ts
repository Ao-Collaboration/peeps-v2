import {TraitData, traitsData} from '../data/traits'
import {
  DEFAULT_HAIR_COLOURS,
  HAIR_COLOURS,
  REQUIRED_CATEGORIES,
  RequiredCategory,
  SKIN_TONES,
  SKIN_TONE_DEFAULT,
} from './constants'

export type FillReplacement = {
  currentFill: string
  replacementFill: string
}

export interface ImageEntry {
  index: number
  filePath: string
  traitName: string
  replacements?: FillReplacement[]
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

const getHairColour = (selectedTraits: TraitData[]): string | undefined => {
  const hairColour = selectedTraits.find(
    trait => trait.headerCategory === 'Hair' && trait.secondaryCategory === 'Colour',
  )
  if (hairColour) {
    return HAIR_COLOURS.get(hairColour.label)
  }
  // Should never happen for a legal peep
  return undefined
}

export const createImageEntries = (selectedTraits: TraitData[]): ImageEntry[] => {
  const entries = [
    ...DEFAULT_IMAGE_ENTRIES,
    ...selectedTraits.flatMap(trait => {
      if (trait.type === 'Automated') {
        if (trait.headerCategory === 'Skin' && trait.secondaryCategory === 'Tone') {
          const skinTone = SKIN_TONES.get(trait.label)
          if (skinTone) {
            return [
              //FIXME Don't do skin like this. Use the pose
              {
                index: 18501,
                filePath: `Hidden/Skin/Basic.svg`,
                traitName: trait.name,
                replacements: [
                  {
                    currentFill: SKIN_TONE_DEFAULT,
                    replacementFill: skinTone,
                  },
                ],
              },
            ]
          }
        }
        if (trait.headerCategory === 'Hair' && trait.secondaryCategory === 'Colour') {
          // Skip hair colour. See handling for Hair Style below
          return []
        }
      } else if (trait.headerCategory === 'Hair' && trait.secondaryCategory === 'Style') {
        // Special case for hair handling
        const filePath = [
          trait.selectionsCategory,
          trait.headerCategory,
          trait.name,
          trait.frontFile,
        ]
          .filter(Boolean)
          .join('/')
        const hairColour = getHairColour(selectedTraits)
        if (!trait.frontIndex) {
          console.error(`Hair style ${trait.name} has no front index`)
          return []
        }
        return [
          {
            index: trait.frontIndex,
            filePath,
            traitName: trait.name,
            replacements: DEFAULT_HAIR_COLOURS.map(defaultColour => ({
              currentFill: defaultColour,
              replacementFill: hairColour!,
            })),
          },
        ]
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

  return entries.sort((a, b) => b.index - a.index)
}

export const legalizeTraits = (selectedTraits: TraitData[]): TraitData[] => {
  // Create a map of required category to selected trait
  const categoryToTrait = new Map<RequiredCategory, TraitData>()

  // First, process all traits in reverse order to find the most recently selected ones
  for (let i = selectedTraits.length - 1; i >= 0; i--) {
    const trait = selectedTraits[i]

    // Find matching required category for this trait
    const matchingCategory = REQUIRED_CATEGORIES.find(required => {
      if (required.secondaryCategory) {
        return (
          trait.headerCategory === required.headerCategory &&
          trait.secondaryCategory === required.secondaryCategory
        )
      }
      return trait.headerCategory === required.headerCategory
    })

    if (matchingCategory && !categoryToTrait.has(matchingCategory)) {
      categoryToTrait.set(matchingCategory, trait)
    }
  }

  // Build the result array
  const result: TraitData[] = []

  // Add all non-required category traits
  selectedTraits.forEach(trait => {
    const isRequired = REQUIRED_CATEGORIES.some(required => {
      if (required.secondaryCategory) {
        return (
          trait.headerCategory === required.headerCategory &&
          trait.secondaryCategory === required.secondaryCategory
        )
      }
      return trait.headerCategory === required.headerCategory
    })

    if (!isRequired) {
      result.push(trait)
    }
  })

  // Add the most recently selected trait for each required category
  REQUIRED_CATEGORIES.forEach(requiredCategory => {
    const trait = categoryToTrait.get(requiredCategory)
    if (trait) {
      result.push(trait)
    } else {
      // If no trait was selected for this category, add the first available one
      const firstTrait = traitsData.find(t => {
        if (requiredCategory.secondaryCategory) {
          return (
            t.headerCategory === requiredCategory.headerCategory &&
            t.secondaryCategory === requiredCategory.secondaryCategory
          )
        }
        return t.headerCategory === requiredCategory.headerCategory
      })
      if (firstTrait) {
        result.push(firstTrait)
      }
    }
  })

  return result
}

export const getDefaultPeep = (): TraitData[] => {
  const defaultTraits: TraitData[] = [
    requireTraitByName('Basic'),
    requireTraitByName('Almond'),
    requireTraitByName('Fantasy'),
    requireTraitByName('Hazel'),
    requireTraitByName('Classic Eyelashes'),
    requireTraitByName('Twin Braids'),
    requireTraitByName('Shocked'),
    requireTraitByName('Bucket Hat'),
    requireTraitByName('Hoop Earrings'),
    requireTraitByName('Muscle T-Shirt'),
    requireTraitByName('Cargo Pants'),
    requireTraitByName('Crocs'),
    requireTraitByName('Beach'),
    requireTraitByName('Sunset'),
  ]

  return legalizeTraits(defaultTraits)
}
