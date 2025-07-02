import type {Handler} from '@netlify/functions'

import type {TraitRequest} from '../types'
import {getCorsHeaders, requirePostRequest} from '../utils/event'
import {getDatabaseId, getNotionClient} from '../utils/notion'

const handler: Handler = async event => {
  const requireResponse = requirePostRequest(event)
  if (requireResponse) return requireResponse
  const headers = getCorsHeaders(event)

  try {
    const data: TraitRequest = JSON.parse(event.body || '')
    console.log('Received trait request:', data)

    const response = await getNotionClient().pages.create({
      parent: {database_id: getDatabaseId('traitRequests')},
      properties: {
        Name: {title: [{text: {content: data.trait}}]},
        'User Email': {email: data.userEmail},
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: data.description,
                },
              },
            ],
          },
        },
      ],
    })
    console.log('New trait request page created:', response.id)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({message: 'Trait request received', pageId: response.id}),
    }
  } catch (err) {
    console.error('Error:', err)
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({error: 'Error processing trait request'}),
    }
  }
}

export {handler}
