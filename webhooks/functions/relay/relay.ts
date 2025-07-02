import type {Handler} from '@netlify/functions'

import type {CreatePeepEntry, DeveloperNotification} from '../types'
import {getCorsHeaders, requirePostRequest} from '../utils/event'
import {formatBirthday} from '../utils/format'
import {getDatabaseId, getNotionClient} from '../utils/notion'

const handler: Handler = async event => {
  const requireResponse = requirePostRequest(event)
  if (requireResponse) return requireResponse
  const headers = getCorsHeaders(event)

  try {
    const data: DeveloperNotification = JSON.parse(event.body || '')
    console.log('Received data:', data)

    const entry: CreatePeepEntry = {
      name: data.peep.name,
      birthday: formatBirthday(data.peep.birthday),
      userEmail: data.userEmail,
      url: data.url,
      timestamp: new Date(), // Ignore the timestamp from the input
    }

    const response = await getNotionClient().pages.create({
      parent: {database_id: getDatabaseId('createdPeeps')},
      properties: {
        Name: {title: [{text: {content: entry.name}}]},
        Birthday: {rich_text: [{text: {content: entry.birthday}}]},
        'User Email': {email: entry.userEmail},
        URL: {url: entry.url},
        Timestamp: {date: {start: entry.timestamp.toISOString()}},
      },
    })
    console.log('New page created:', response.id)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({message: 'Notification received', pageId: response.id}),
    }
  } catch (err) {
    console.error('Error:', err)
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({error: 'Error processing request'}),
    }
  }
}

export {handler}
