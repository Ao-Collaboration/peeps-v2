import {TraitData, getTraitsData} from '../data/traits'
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
  trait?: TraitData
  replacements?: FillReplacement[]
}

const DEFAULT_IMAGE_ENTRIES: ImageEntry[] = [
  {
    index: 16000,
    filePath: 'Hidden/Eye Whites/Basic/Base.svg',
  },
  {
    index: 17000,
    filePath: 'Hidden/Head/Basic/Base.svg',
  },
]

export const requireTraitByName = (traitsData: TraitData[], name: string): TraitData => {
  const trait = traitsData.find(trait => trait.name === name)
  if (!trait) {
    throw new Error(`Trait not found: ${name}`)
  }
  return trait
}

const getHairColour = (selectedTraits: TraitData[]): string | undefined => {
  const hairColour = selectedTraits.find(
    trait => trait.category2 === 'Hair' && trait.category3 === 'Colour',
  )
  if (hairColour) {
    return HAIR_COLOURS.get(hairColour.name)
  }
  // Should never happen for a legal peep
  return undefined
}

export const createImageEntries = (selectedTraits: TraitData[]): ImageEntry[] => {
  // Get the pose trait
  const pose = selectedTraits.find(trait => trait.category1 === 'Pose')
  if (!pose) {
    // Should never happen for a legal peep
    console.error('No pose trait found')
    return []
  }

  const poseNameCamel = pose.name.replace(/\s+/g, '').replace(/^[A-Z]/, c => c.toLowerCase())
  const frontFileVar = `${poseNameCamel}FrontFile` as keyof TraitData
  const backFileVar = `${poseNameCamel}BackFile` as keyof TraitData

  let entries: ImageEntry[] = [
    ...DEFAULT_IMAGE_ENTRIES,
    ...selectedTraits.flatMap(trait => {
      if (trait.category2 === 'Skin' && trait.category3 === 'Tone') {
        const skinTone = SKIN_TONES.get(trait.name)
        if (skinTone) {
          return [
            //FIXME Don't do skin like this. Use the pose
            {
              index: 18501,
              filePath: `Hidden/Skin/Basic.svg`,
              trait,
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
      if (trait.category2 === 'Hair' && trait.category3 === 'Colour') {
        // Skip hair colour. See handling for Hair Style below
        return []
      }
      if (
        (trait.category2 === 'Hair' && trait.category3 === 'Style') ||
        trait.category2 === 'Facial Hair'
      ) {
        // Special case for hair handling
        const filePath = [
          trait.category1,
          trait.category2,
          trait.name,
          pose.name,
          trait[frontFileVar],
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
            trait,
            replacements: DEFAULT_HAIR_COLOURS.map(defaultColour => ({
              currentFill: defaultColour,
              replacementFill: hairColour!,
            })),
          },
        ]
      } else {
        const traitEntries: ImageEntry[] = []
        const addEntry = (
          trait: TraitData,
          poseName: string,
          index?: number,
          fileName?: string,
        ) => {
          if (index && fileName) {
            const filePath = [trait.category1, trait.category2, trait.name, poseName, fileName]
              .filter(Boolean)
              .join('/')
            traitEntries.push({
              index,
              filePath,
              trait,
            })
          }
        }
        if (!trait[backFileVar] && !trait[frontFileVar]) {
          console.error(`Trait ${trait.name} has no back or front file for pose ${pose.name}`)
          return []
        }
        addEntry(trait, pose.name, trait.backIndex, trait[backFileVar] as string | undefined)
        addEntry(trait, pose.name, trait.frontIndex, trait[frontFileVar] as string | undefined)
        return traitEntries
      }
    }),
  ]

  // Handle dev tags
  const hasHideHair = selectedTraits.some(trait => trait.devTags?.includes('Hide Hair'))
  if (hasHideHair) {
    // Remove the hair entries
    entries = entries.filter(entry => entry.trait?.category2 !== 'Hair')
  }

  return entries.sort((a, b) => b.index - a.index)
}

export const legalizeTraits = (
  allTraitData: TraitData[],
  selectedTraits: TraitData[],
): TraitData[] => {
  // Create a map of required category to selected trait
  const categoryToTrait = new Map<RequiredCategory, TraitData>()

  // First, process all traits in reverse order to find the most recently selected ones
  for (let i = selectedTraits.length - 1; i >= 0; i--) {
    const trait = selectedTraits[i]

    // Find matching required category for this trait
    const matchingCategory = REQUIRED_CATEGORIES.find(required => {
      if (required.category3) {
        return trait.category2 === required.category2 && trait.category3 === required.category3
      }
      return trait.category2 === required.category2
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
      if (required.category3) {
        return trait.category2 === required.category2 && trait.category3 === required.category3
      }
      return trait.category2 === required.category2
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
      const firstTrait = allTraitData.find(t => {
        if (requiredCategory.category3) {
          return (
            t.category2 === requiredCategory.category2 && t.category3 === requiredCategory.category3
          )
        }
        return t.category2 === requiredCategory.category2
      })
      if (firstTrait) {
        result.push(firstTrait)
      }
    }
  })

  return result
}

export const getDefaultPeep = (): TraitData[] => {
  const traitsData = getTraitsData()
  const defaultTraits: TraitData[] = [
    requireTraitByName(traitsData, 'Basic'),
    requireTraitByName(traitsData, 'Almond'),
    requireTraitByName(traitsData, 'Fantasy'),
    requireTraitByName(traitsData, 'Hazel'),
    requireTraitByName(traitsData, 'Classic Eyelashes'),
    requireTraitByName(traitsData, 'Twin Braids'),
    requireTraitByName(traitsData, 'Shocked'),
    requireTraitByName(traitsData, 'Bucket Hat'),
    requireTraitByName(traitsData, 'Hoop Earrings'),
    requireTraitByName(traitsData, 'Muscle T-Shirt'),
    requireTraitByName(traitsData, 'Cargo Pants'),
    requireTraitByName(traitsData, 'Crocs'),
    requireTraitByName(traitsData, 'Beach'),
    requireTraitByName(traitsData, 'Sunset'),
  ]

  return legalizeTraits(traitsData, defaultTraits)
}

export const getRandomPeep = (allTraitData: TraitData[]): TraitData[] => {
  const randomTraits: TraitData[] = []

  // For each required category (+ tops and bottoms), find all matching traits and randomly select one
  const requiredCategories = [
    ...REQUIRED_CATEGORIES,
    {
      category2: 'Tops',
    },
    {
      category2: 'Bottoms',
    },
  ]
  requiredCategories.forEach(requiredCategory => {
    const matchingTraits = allTraitData.filter(trait => {
      if (requiredCategory.category3) {
        return (
          trait.category2 === requiredCategory.category2 &&
          trait.category3 === requiredCategory.category3
        )
      }
      return trait.category2 === requiredCategory.category2
    })

    if (matchingTraits.length > 0) {
      const randomIndex = Math.floor(Math.random() * matchingTraits.length)
      randomTraits.push(matchingTraits[randomIndex])
    }
  })

  return legalizeTraits(allTraitData, randomTraits)
}

// Convert traits array to a URL-safe string
export function encodeTraitsToString(traits: TraitData[], name: string): string {
  // Create a minimal representation of traits using just the name property
  const minimalTraits = traits.map((t: TraitData) => t.id)
  const data = {traits: minimalTraits, name: name}
  // Convert to base64 and make URL safe
  return btoa(JSON.stringify(data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// Convert URL string back to traits array
export function decodeTraitsFromString(
  encoded: string,
): {traits: TraitData[]; name: string} | null {
  const allTraitData = getTraitsData(true) // Override admin check
  try {
    // Restore base64 padding and decode
    const padded = encoded + '='.repeat((4 - (encoded.length % 4)) % 4)
    const decoded = padded.replace(/-/g, '+').replace(/_/g, '/')
    const data = JSON.parse(atob(decoded))

    // Validate the structure
    if (!data.traits || !Array.isArray(data.traits) || typeof data.name !== 'string') {
      return null
    }

    // Convert trait names back to full trait objects
    const decodedTraits: TraitData[] = []
    for (const id of data.traits) {
      const trait = allTraitData.find((t: TraitData) => t.id === id)
      if (trait) {
        decodedTraits.push(trait)
      } else {
        console.error('Invalid trait id in encoded string', id)
      }
    }

    // Legalize the traits
    const legalizedTraits = legalizeTraits(allTraitData, decodedTraits)

    return {traits: legalizedTraits, name: data.name}
  } catch (e) {
    return null
  }
}
