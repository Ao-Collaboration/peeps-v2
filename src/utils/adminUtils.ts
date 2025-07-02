import {PeepMetadata} from '../types/metadata'

const WEBHOOKS_URL = import.meta.env.VITE_WEBHOOKS_URL

interface DeveloperNotification {
  action: 'save' | 'share'
  userEmail: string
  peep: Omit<PeepMetadata, 'traits'> & {traits: string[]} // Traits as names only
  url: string
  timestamp: string
}

interface TraitRequest {
  trait: string
  description: string
  userEmail: string
}

export const notifyDevelopers = async (
  action: 'save' | 'share',
  peep: PeepMetadata,
  userEmail: string | null,
  url: string,
): Promise<void> => {
  if (!WEBHOOKS_URL) {
    console.warn('Webhook URL not configured')
    return
  }

  const relayUrl = `${WEBHOOKS_URL}/relay`

  try {
    const notification: DeveloperNotification = {
      action,
      userEmail: userEmail ?? 'unknown',
      peep: {
        name: peep.name,
        birthday: peep.birthday,
        traits: peep.traits.map(trait => trait.name),
      },
      url,
      timestamp: new Date().toISOString(),
    }

    const response = await fetch(relayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    })
    console.log('Developer notification sent', response.status)
    console.log(await response.json())
  } catch (error) {
    // Log and continue
    console.error('Failed to send developer notification:', error)
  }
}

export const sendTraitRequest = async (
  trait: string,
  description: string,
  userEmail: string | null,
): Promise<void> => {
  if (!WEBHOOKS_URL) {
    console.warn('Webhook URL not configured')
    return
  }

  const requestUrl = `${WEBHOOKS_URL}/request`

  try {
    const traitRequest: TraitRequest = {
      trait,
      description,
      userEmail: userEmail ?? 'unknown',
    }

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(traitRequest),
    })
    console.log('Trait request sent', response.status)
    console.log(await response.json())
  } catch (error) {
    // Log and continue
    console.error('Failed to send trait request:', error)
  }
}
