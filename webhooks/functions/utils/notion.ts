import {Client} from '@notionhq/client'

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

type DatabaseId = 'createdPeeps' | 'traitRequests'

export function getDatabaseId(databaseId: DatabaseId): string {
  let dbId: string | undefined
  if (databaseId === 'createdPeeps') {
    dbId = process.env.NOTION_CREATEDPEEPS_DATABASE_ID
  }
  if (databaseId === 'traitRequests') {
    dbId = process.env.NOTION_TRAITREQUESTS_DATABASE_ID
  }

  if (!dbId) {
    throw new Error(`${databaseId} database ID is not set`)
  }
  return dbId
}
