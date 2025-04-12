import {TraitData} from '../data/traits'

export interface Birthday {
  day: number
  month: number
}

export interface PeepMetadata {
  name: string
  birthday: Birthday
  traits: TraitData[]
}
