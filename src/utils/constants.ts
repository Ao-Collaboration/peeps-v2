import {Stage} from '../data/traits'

export const SKIN_TONE_DEFAULT = '#f7e2ab'

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

export const DEFAULT_HAIR_COLOURS = ['#ff8080', '#ff8d8d']

export const HAIR_COLOURS: Map<string, string> = new Map([
  ['Platinum', '#FFFFFF'],
  ['Blonde', '#FEF5CE'],
  ['Mousey', '#E4D385'],
  ['Light Brown', '#CD9B66'],
  ['Mid Brown', '#956746'],
  ['Dark Brown', '#371F0F'],
  ['Black', '#303433'],
  ['Purple', '#643B5B'],
  ['Pink', '#D57FC0'],
  ['Amethyst', '#907ABB'],
  ['Blue', '#5E87C5'],
  ['Teal', '#8FDCE2'],
  ['Pale Green', '#A4CFB4'],
  ['Green', '#7EAF5E'],
  ['Copper', '#D08565'],
  ['Auburn', '#9D2A23'],
  ['Grey', '#E5CCD2'],
])

export type RequiredCategory = {
  category1: string
  category2?: string
  category3?: string
}

export const REQUIRED_CATEGORIES: RequiredCategory[] = [
  {category1: 'Location', category2: 'District'},
  {category1: 'Location', category2: 'Time'},
  {category1: 'Body', category2: 'Eyes', category3: 'Style'},
  {category1: 'Body', category2: 'Eyes', category3: 'Colour'},
  {category1: 'Body', category2: 'Eyes', category3: 'Lashes'},
  {category1: 'Body', category2: 'Skin', category3: 'Tone'},
  {category1: 'Body', category2: 'Hair', category3: 'Style'},
  {category1: 'Body', category2: 'Hair', category3: 'Colour'},
  {category1: 'Body', category2: 'Expression'},
  {category1: 'Pose'},
]

export const STAGE_TO_COLOR_CLASS: Record<Stage, string> = {
  Final: '',
  'In Quality Control': 'bg-blue-500',
  Bug: 'bg-red-500',
  'Art Updates': 'bg-yellow-500',
}
