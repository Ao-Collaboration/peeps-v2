import type {HandlerEvent, HandlerResponse} from '@netlify/functions'

const allowedOrigins = process.env.NETLIFY_ALLOWED_ORIGINS?.split(',').filter(Boolean) || []

export function getCorsHeaders(event: HandlerEvent) {
  return {
    'Access-Control-Allow-Origin': allowedOrigins.includes(event.headers.origin || '')
      ? event.headers.origin || '*'
      : '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

export function requirePostRequest(event: HandlerEvent): HandlerResponse | null {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: 'OK',
    }
  }
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: getCorsHeaders(event),
      body: JSON.stringify({error: 'Method Not Allowed'}),
    }
  }
  return null
}
