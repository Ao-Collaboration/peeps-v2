import {TraitData} from './traits'
import {requireTraitByName} from './utils'

export const SKIN_TONES: Map<string, string> = new Map([
  ['Almond', '#94613c'],
  ['Band', '#ac8b64'],
  ['Honey', '#cb9661'],
  ['Senna', '#cf9e7c'],
  ['Beige', '#ecbf83'],
  ['Limestone', '#e7bc91'],
  ['Ivory', '#eacba8'],
  ['Porcelain', '#eed0b8'],
  ['Pale Ivory', '#f7ddc4'],
  ['Warm Ivory', '#f7e2ab'],
  ['Sand', '#eec794'],
  ['Rose Beige', '#f0c08a'],
  ['Chocolate', '#3a1e08'],
  ['Espresso', '#623a18'],
  ['Golden', '#804a2a'],
  ['Umber', '#b26a49'],
  ['Bronze', '#77441f'],
  ['Chestnut', '#895532'],
  ['Zombie', '#689a6c'],
  ['Vampire', '#fdfff5'],
  ['Ghoul', '#f4f4f4'],
  ['Wicked', '#dbc8ff'],
  ['Blue', '#b4e1ef'],
  ['Alien', '#a6f9de'],
])

export const getDefaultPeep = (): TraitData[] => {
  return [requireTraitByName('Basic'), requireTraitByName('Almond'), requireTraitByName('Cat Ears')]
}
