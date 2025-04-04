import {config as dotenvConfig} from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

import {Client} from '@notionhq/client'

import {ALWAYS_DEFINED_FIELDS, IGNORED_FIELDS, PATHS} from './constants'

// Load environment variables from .env file
dotenvConfig()

// Initialize the Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

async function cleanFolders() {
  const paths = [PATHS.NOTION_DATA_FILE, PATHS.TRAITS_TS_FILE]
  for (const path of paths) {
    if (fs.existsSync(path)) {
      fs.rmSync(path, {recursive: true})
    }
  }
}

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
            case 'files':
              if (property.files.length === 1) {
                console.log(JSON.stringify(property.files[0], null, 2))
                row[key] = {
                  url: property.files[0].file.url,
                  name: property.files[0].name,
                }
              } else {
                if (property.files.length > 1) {
                  const fname1 = property.files[0].name
                  console.log(`Multiple files for ${key}:`, fname1, property.files)
                }
                row[key] = ''
              }
              break
            case 'status':
              row[key] = property.status?.name
              break
            case 'relation':
            case 'people':
            case 'formula':
              // Ignore these types
              row[key] = ''
              break
            default:
              console.log(`Unknown property type: ${property.type}`, property)
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
  }
}

function readJsonFile(jsonFilePath: string) {
  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'))
  if (jsonData.length === 0) {
    console.error('No data found in the JSON file')
    return
  }
  return jsonData
}

/**
 * Converts the downloaded JSON data into a TypeScript file with a TraitData type
 * @param jsonFilePath Path to the downloaded JSON file
 */
function convertJsonToTypeScript(jsonFilePath: string) {
  try {
    // Read the JSON file
    const jsonData = readJsonFile(jsonFilePath)

    // Get the first item to determine the structure
    const sampleItem = jsonData[0]

    // Define field name mappings (original name -> camelCase name)
    const fieldMappings: Record<string, string> = {}

    // Create mappings for all fields
    Object.keys(sampleItem).forEach(key => {
      // Skip the ignored fields
      if (IGNORED_FIELDS.has(key)) {
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

    // Collect unique values for each category field
    const uniqueValues: Record<string, Set<string>> = {
      mobileUIArea: new Set(),
      headerCategory: new Set(),
      selectionsCategory: new Set(),
      secondaryCategory: new Set(),
    }

    // Populate unique values
    jsonData.forEach((item: any) => {
      if (item['Mobile UI Area']) uniqueValues.mobileUIArea.add(item['Mobile UI Area'])
      if (item['Header Category']) uniqueValues.headerCategory.add(item['Header Category'])
      if (item['Selections Category'])
        uniqueValues.selectionsCategory.add(item['Selections Category'])
      if (item['Secondary Category']) uniqueValues.secondaryCategory.add(item['Secondary Category'])
    })

    // Create the TypeScript type definition
    let typeDefinition =
      'export type MobileUIArea = ' +
      Array.from(uniqueValues.mobileUIArea)
        .map(v => `'${v}'`)
        .join(' | ') +
      '\n\n'

    typeDefinition +=
      'export type HeaderCategory = ' +
      Array.from(uniqueValues.headerCategory)
        .map(v => `'${v}'`)
        .join(' | ') +
      '\n\n'

    typeDefinition +=
      'export type SelectionsCategory = ' +
      Array.from(uniqueValues.selectionsCategory)
        .map(v => `'${v}'`)
        .join(' | ') +
      '\n\n'

    typeDefinition +=
      'export type SecondaryCategory = ' +
      Array.from(uniqueValues.secondaryCategory)
        .map(v => `'${v}'`)
        .join(' | ') +
      '\n\n'

    typeDefinition += 'export interface TraitData {\n'

    // Add properties to the type definition using the mapped names
    Object.keys(sampleItem).forEach(key => {
      // Skip the ignored fields
      if (IGNORED_FIELDS.has(key)) {
        return
      }

      const camelCaseKey = fieldMappings[key]
      const value = sampleItem[key]

      // Determine the type based on the value
      let type: string
      if (value === null || typeof value === 'number') {
        // Null values are always numbers
        type = 'number'
      } else if (typeof value === 'boolean') {
        type = 'boolean'
      } else if (Array.isArray(value)) {
        type = 'string[]'
      } else if (typeof value === 'object') {
        // This is the file object. We will only output the file name
        type = 'string'
      } else {
        type = 'string'
      }

      // Override types for category fields
      if (key === 'Mobile UI Area') {
        type = 'MobileUIArea'
      } else if (key === 'Header Category') {
        type = 'HeaderCategory'
      } else if (key === 'Selections Category') {
        type = 'SelectionsCategory'
      } else if (key === 'Secondary Category') {
        type = 'SecondaryCategory'
      }

      if (ALWAYS_DEFINED_FIELDS.has(key) || type === 'string[]') {
        typeDefinition += `  ${camelCaseKey}: ${type};\n`
      } else {
        typeDefinition += `  ${camelCaseKey}?: ${type};\n`
      }
    })

    typeDefinition += '}\n\n'

    // Filter and sort the data
    const validItems = jsonData
      .filter((item: any) => {
        const isValid =
          item['Name'] &&
          item['Label'] &&
          item['Stage'] === 'Final' &&
          item['Selections Category'] &&
          item['Selections Category'] !== 'Hidden'

        if (!isValid) {
          console.log(`Skipping invalid item: ${item['Name'] || 'Unnamed'}`)
        }
        return isValid
      })
      .sort((a: any, b: any) => {
        const compareNullable = (a?: string, b?: string) => {
          if (a !== b) {
            return (a ?? '').localeCompare(b ?? '')
          }
          return 0
        }

        // First sort by Selections Category
        const selectionsCompare = compareNullable(
          a['Selections Category'],
          b['Selections Category'],
        )
        if (selectionsCompare !== 0) {
          return selectionsCompare
        }

        // Then by Header Category
        const headerCompare = compareNullable(a['Header Category'], b['Header Category'])
        if (headerCompare !== 0) {
          return headerCompare
        }

        // Then by Secondary Category
        const secondaryCompare = compareNullable(a['Secondary Category'], b['Secondary Category'])
        if (secondaryCompare !== 0) {
          return secondaryCompare
        }

        // Finally by Label
        return compareNullable(a['Label'], b['Label'])
      })

    console.log(`Found ${validItems.length} valid items out of ${jsonData.length} total items`)

    // Create the data export
    let dataExport = 'export const traitsData: TraitData[] = [\n'

    // Add each item to the data export
    validItems.forEach((item: any, index: number) => {
      dataExport += '  {\n'

      Object.keys(item).forEach(key => {
        // Skip the ignored fields
        if (IGNORED_FIELDS.has(key)) {
          return
        }

        const camelCaseKey = fieldMappings[key]
        const value = item[key]

        if (typeof value === 'string') {
          // Skip empty strings
          if (value.trim() === '') {
            return
          }
          dataExport += `    ${camelCaseKey}: "${value.replace(/"/g, '\\"')}",\n`
        } else if (value === null) {
          // Skip null values
          return
        } else if (Array.isArray(value)) {
          dataExport += `    ${camelCaseKey}: ${JSON.stringify(value)},\n`
        } else if (typeof value === 'object' && value !== null) {
          // This is the file object. Skip if name is empty
          if (!value.name || value.name.trim() === '') {
            return
          }
          dataExport += `    ${camelCaseKey}: "${value.name}",\n`
        } else {
          dataExport += `    ${camelCaseKey}: ${value},\n`
        }
      })

      dataExport += '  }' + (index < validItems.length - 1 ? ',' : '') + '\n'
    })

    dataExport += '];\n'

    // Create the output directory if it doesn't exist
    const outputDir = path.dirname(PATHS.TRAITS_TS_FILE)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {recursive: true})
    }

    // Write the TypeScript file
    fs.writeFileSync(PATHS.TRAITS_TS_FILE, typeDefinition + dataExport)

    console.log(`Successfully converted JSON data to TypeScript`)
    console.log(`TypeScript file saved to: ${PATHS.TRAITS_TS_FILE}`)
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
    await cleanFolders()
    const jsonFilePath = await downloadNotionTable(process.env.NOTION_DATABASE_ID as string)
    convertJsonToTypeScript(jsonFilePath)
  })()
}
