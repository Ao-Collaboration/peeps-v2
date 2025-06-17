import {config as dotenvConfig} from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

import {Client} from '@notionhq/client'
import type {
  PageObjectResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints'

// Load environment variables
dotenvConfig()

// Singleton Notion client
let notionClient: Client | null = null

export function getNotionClient(): Client {
  if (!notionClient) {
    if (!process.env.NOTION_TOKEN) {
      throw new Error('NOTION_TOKEN environment variable is not set')
    }
    notionClient = new Client({auth: process.env.NOTION_TOKEN})
  }
  return notionClient
}

// Extract value from a Notion property based on its type
export function extractPropertyValue(
  property: PageObjectResponse['properties'][string],
): string | number | null | {url: string; name: string} | string[] | boolean {
  switch (property.type) {
    case 'title':
      return property.title?.[0]?.plain_text?.trim() || ''
    case 'rich_text':
      return property.rich_text?.[0]?.plain_text?.trim() || ''
    case 'number':
      return property.number
    case 'select':
      return property.select?.name?.trim() || ''
    case 'multi_select':
      return property.multi_select?.map(item => item.name) || []
    case 'date':
      return property.date?.start || ''
    case 'checkbox':
      return property.checkbox
    case 'files':
      if (property.files.length === 1) {
        const f = property.files[0]
        if (f.type === 'file') {
          return {url: f.file.url, name: f.name}
        }
        if (f.type === 'external') {
          return {url: f.external.url, name: f.name}
        }
      }
      return null
    case 'status':
      return property.status?.name?.trim() || ''
    case 'unique_id':
      return property.unique_id?.number
    case 'relation':
    case 'people':
    case 'formula':
      // Ignore these types
      return null
    default:
      console.log(`Unknown property type: ${property.type}`, property)
      return null
  }
}

// Validate required environment variables
export function validateEnvVars(requiredVars: string[]) {
  const missing = requiredVars.filter(varName => !process.env[varName])
  if (missing.length > 0) {
    console.error(`Please set the following environment variables: ${missing.join(', ')}`)
    process.exit(1)
  }
}

// Ensure directory exists
export function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, {recursive: true})
  }
}

// Fetch all pages from a Notion database
export async function fetchAllPages(databaseId: string): Promise<PageObjectResponse[]> {
  const notion = getNotionClient()
  let all: PageObjectResponse[] = []
  let cursor: string | undefined = undefined

  do {
    const resp: QueryDatabaseResponse = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
      start_cursor: cursor,
    })
    all = all.concat(resp.results as PageObjectResponse[])
    cursor = resp.has_more ? resp.next_cursor! : undefined
  } while (cursor)

  return all
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function writeJsonToFile(data: any, filePath: string) {
  writeToFile(JSON.stringify(data, null, 2), filePath)
}

export function writeToFile(data: string, filePath: string) {
  const dirPath = path.dirname(filePath)
  ensureDirectoryExists(dirPath)
  fs.writeFileSync(filePath, data)
  console.log(`Data saved to: ${filePath}`)
}

// Read JSON file
export function readJsonFile(filePath: string) {
  const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (jsonData.length === 0) {
    console.error('No data found in the JSON file')
    return
  }
  return jsonData
}

// Clean up files
export function cleanFiles(filePaths: string[]) {
  for (const path of filePaths) {
    if (fs.existsSync(path)) {
      fs.rmSync(path, {recursive: true})
    }
  }
}
