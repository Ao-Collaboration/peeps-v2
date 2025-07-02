export interface Birthday {
  day: number
  month: number
}

export interface PeepMetadata {
  name: string
  birthday: Birthday
  //   traits: string[]; // Names of traits
}

export interface DeveloperNotification {
  action: 'save' | 'share'
  userEmail: string
  peep: PeepMetadata
  url: string
  timestamp: string
}

export interface CreatePeepEntry {
  name: string
  birthday: string
  userEmail: string
  url: string
  timestamp: Date
}
