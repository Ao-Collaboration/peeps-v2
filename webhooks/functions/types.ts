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
