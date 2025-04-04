import {TraitData, traitsData} from './traits'

export const requireTraitByName = (name: string): TraitData => {
  const trait = traitsData.find(trait => trait.name === name)
  if (!trait) {
    throw new Error(`Trait not found: ${name}`)
  }
  return trait
}
