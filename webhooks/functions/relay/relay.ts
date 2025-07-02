import type {Handler} from '@netlify/functions'
import {Client} from '@notionhq/client'

import type {CreatePeepEntry, DeveloperNotification} from '../types'
import {formatBirthday} from '../utils/format'

const allowedOrigins = process.env.NETLIFY_ALLOWED_ORIGINS?.split(',').filter(Boolean) || []
const createdDatabaseId = process.env.NOTION_CREATEDPEEPS_DATABASE_ID
const notionApiKey = process.env.NOTION_TOKEN

if (!notionApiKey) {
  throw new Error('NOTION_TOKEN is not set')
}
if (!createdDatabaseId) {
  throw new Error('NOTION_CREATEDPEEPS_DATABASE_ID is not set')
}

const notionClient = new Client({
  auth: notionApiKey,
})

const handler: Handler = async event => {
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(event.headers.origin || '')
      ? event.headers.origin || '*'
      : '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
  console.log('Allowed origins:', allowedOrigins)
  console.log('Origin:', event.headers.origin)

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: 'OK',
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({error: 'Method Not Allowed'}),
    }
  }

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

    const response = await notionClient.pages.create({
      parent: {database_id: createdDatabaseId},
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
