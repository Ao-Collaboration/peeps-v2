import type {Handler} from '@netlify/functions'

import type {DeveloperNotification} from '../types'

const allowedOrigins = process.env.NETLIFY_ALLOWED_ORIGINS?.split(',').filter(Boolean) || []

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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({message: 'Notification received', data}),
    }
  } catch (err) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({error: 'Invalid JSON'}),
    }
  }
}

export {handler}
