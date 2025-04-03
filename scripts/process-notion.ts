import {Client} from '@notionhq/client'
import * as fs from 'fs'
import * as path from 'path'
import {config as dotenvConfig} from 'dotenv'

// Load environment variables from .env file
dotenvConfig()

// Initialize the Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

async function downloadNotionTable(databaseId: string): Promise<string> {
  try {
    let allResults: any[] = []
    let hasMore = true
    let startCursor: string | undefined

    // Keep fetching pages until we have all results
    while (hasMore) {
      const response = await notion.databases.query({
        database_id: databaseId,
        start_cursor: startCursor,
        page_size: 100, // Maximum allowed by Notion API
      })

      allResults = [...allResults, ...response.results]
      hasMore = response.has_more
      startCursor = response.next_cursor || undefined

      console.log(`Fetched ${allResults.length} items so far...`)
    }

    console.log(`Total items fetched: ${allResults.length}`)

    // Transform the results into a more usable format
    const transformedData = allResults
      .map(page => {
        const properties = page.properties
        const row: Record<string, any> = {}

        // Extract each property from the page
        Object.keys(properties).forEach(key => {
          const property = properties[key] as any

          // Handle different property types
          switch (property.type) {
            case 'title':
              row[key] = property.title?.[0]?.plain_text || ''
              break
            case 'rich_text':
              row[key] = property.rich_text?.[0]?.plain_text || ''
              break
            case 'number':
              row[key] = property.number
              break
            case 'select':
              row[key] = property.select?.name || ''
              break
            case 'multi_select':
              row[key] = property.multi_select?.map((item: any) => item.name) || []
              break
            case 'date':
              row[key] = property.date?.start || ''
              break
            case 'checkbox':
              row[key] = property.checkbox
              break
            default:
              row[key] = ''
          }
        })

        return row
      })
      .filter(Boolean) // Remove any null entries

    console.log(`Total rows: ${transformedData.length}`)

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir)
    }

    // Save the data to a JSON file
    const outputPath = path.join(outputDir, 'notion-data.json')
    fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2))

    console.log(`Successfully downloaded ${transformedData.length} rows from Notion`)
    console.log(`Data saved to: ${outputPath}`)

    return outputPath
  } catch (error) {
    console.error('Error downloading Notion data:', error)
    process.exit(1)
    throw error // This line will never be reached due to process.exit(1)
  }
}

/**
 * Converts the downloaded JSON data into a TypeScript file with a TraitData type
 * @param jsonFilePath Path to the downloaded JSON file
 */
function convertJsonToTypeScript(jsonFilePath: string) {
  try {
    // Read the JSON file
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'))

    if (jsonData.length === 0) {
      console.error('No data found in the JSON file')
      return
    }

    // Get the first item to determine the structure
    const sampleItem = jsonData[0]

    // Define field name mappings (original name -> camelCase name)
    const fieldMappings: Record<string, string> = {}

    const ignoredFields = [
      'Comments',
      'Old Category',
      'Name Suggestions',
      'Assigned To',
      'Type',
      'Rename Guide',
      'Stage',
      'Exclusions',
      'Related to Traits List (Exclusions)',
      'Rules for Devs',
    ]

    // Create mappings for all fields
    Object.keys(sampleItem).forEach(key => {
      // Skip the "Comments" field
      if (ignoredFields.includes(key)) {
        return
      }

      // Convert key to camelCase for TypeScript convention
      // First, replace spaces with underscores, then convert to camelCase
      const camelCaseKey = key
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/[()]/g, '') // Remove parentheses
        .replace(/_([a-zA-Z])/g, (_, letter) => letter.toUpperCase()) // Convert snake_case to camelCase
        .replace(/^[A-Z]/, letter => letter.toLowerCase()) // Ensure first letter is lowercase

      fieldMappings[key] = camelCaseKey
    })

    // Create the TypeScript type definition
    let typeDefinition = 'export interface TraitData {\n'

    // Add properties to the type definition using the mapped names
    Object.keys(sampleItem).forEach(key => {
      // Skip the "Comments" field
      if (ignoredFields.includes(key)) {
        return
      }

      const camelCaseKey = fieldMappings[key]

      // Determine the type based on the value
      let type = 'string'
      const value = sampleItem[key]

      if (typeof value === 'number') {
        type = 'number'
      } else if (typeof value === 'boolean') {
        type = 'boolean'
      } else if (Array.isArray(value)) {
        type = 'string[]'
      } else if (value === null) {
        // Nullable values are always numbers
        type = 'number | null'
      }

      typeDefinition += `  ${camelCaseKey}: ${type};\n`
    })

    typeDefinition += '}\n\n'

    // Create the data export
    let dataExport = 'export const traitsData: TraitData[] = [\n'

    // Add each item to the data export
    jsonData.forEach((item: any, index: number) => {
      dataExport += '  {\n'

      Object.keys(item).forEach(key => {
        // Skip the "Comments" field
        if (ignoredFields.includes(key)) {
          return
        }

        const camelCaseKey = fieldMappings[key]
        const value = item[key]

        if (typeof value === 'string') {
          dataExport += `    ${camelCaseKey}: "${value.replace(/"/g, '\\"')}",\n`
        } else if (Array.isArray(value)) {
          dataExport += `    ${camelCaseKey}: ${JSON.stringify(value)},\n`
        } else {
          dataExport += `    ${camelCaseKey}: ${value},\n`
        }
      })

      dataExport += '  }' + (index < jsonData.length - 1 ? ',' : '') + '\n'
    })

    dataExport += '];\n'

    // Create the output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'src', 'data')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {recursive: true})
    }

    // Write the TypeScript file
    const outputPath = path.join(outputDir, 'traits.ts')
    fs.writeFileSync(outputPath, typeDefinition + dataExport)

    console.log(`Successfully converted JSON data to TypeScript`)
    console.log(`TypeScript file saved to: ${outputPath}`)
  } catch (error) {
    console.error('Error converting JSON to TypeScript:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  // Check for environment variables
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    console.error('Please set the NOTION_TOKEN and NOTION_DATABASE_ID environment variables')
    process.exit(1)
  }

  // Run the download function and then convert to TypeScript
  ;(async () => {
    const jsonFilePath = await downloadNotionTable(process.env.NOTION_DATABASE_ID as string)
    convertJsonToTypeScript(jsonFilePath)
  })()
}
