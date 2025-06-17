/* eslint-disable @typescript-eslint/no-explicit-any */
import {PATHS} from './constants'
import {
  cleanFiles,
  extractPropertyValue,
  fetchAllPages,
  readJsonFile,
  validateEnvVars,
  writeJsonToFile,
  writeToFile,
} from './notion-utils'

async function downloadNotionTable(databaseId: string): Promise<string> {
  try {
    const allResults = await fetchAllPages(databaseId)
    console.log(`Total items fetched: ${allResults.length}`)

    // Transform the results into a more usable format
    const transformedData = allResults
      .map(page => {
        const properties = page.properties
        const row: Record<string, any> = {}

        // Extract each property from the page using extractPropertyValue
        Object.keys(properties).forEach(key => {
          row[key] = extractPropertyValue(properties[key])
        })

        return row
      })
      .filter(Boolean) // Remove any null entries

    console.log(`Total rows: ${transformedData.length}`)

    // Save the data to a JSON file
    writeJsonToFile(transformedData, PATHS.TRAITS_DATA_FILE)

    console.log(`Successfully downloaded ${transformedData.length} rows from Notion`)
    console.log(`Data saved to: ${PATHS.TRAITS_DATA_FILE}`)

    return PATHS.TRAITS_DATA_FILE
  } catch (error) {
    console.error('Error downloading Notion data:', error)
    process.exit(1)
  }
}

/**
 * Converts the downloaded JSON data into a TypeScript file with a TraitData type
 * @param jsonFilePath Path to the downloaded JSON file
 */
function convertJsonToTypeScript(jsonFilePath: string) {
  try {
    // Read the JSON file
    const jsonData = readJsonFile(jsonFilePath)
    if (!jsonData) return

    // Collect unique values for each category field
    const uniqueValues: Record<string, Set<string>> = {
      ZoomArea: new Set(),
      Category1: new Set(),
      Category2: new Set(),
      Category3: new Set(),
    }

    // Populate unique values
    jsonData.forEach((item: any) => {
      if (item['Zoom Area']) uniqueValues.ZoomArea.add(item['Zoom Area'])
      if (item['Category 1 Old']) uniqueValues.Category1.add(item['Category 1 Old'])
      if (item['Category 2']) uniqueValues.Category2.add(item['Category 2'])
      if (item['Category 3']) uniqueValues.Category3.add(item['Category 3'])
    })

    // Remove Hidden from all sets
    uniqueValues.ZoomArea.delete('Hidden')
    uniqueValues.Category1.delete('Hidden')
    uniqueValues.Category2.delete('Hidden')
    uniqueValues.Category3.delete('Hidden')

    // Create the TypeScript type definition
    let typeDefinition =
      'export type ZoomArea = ' +
      Array.from(uniqueValues.ZoomArea)
        .sort()
        .map(v => `'${v}'`)
        .join(' | ') +
      '\n\n'

    typeDefinition +=
      'export type Category1 = ' +
      Array.from(uniqueValues.Category1)
        .sort()
        .map(v => `'${v}'`)
        .join(' | ') +
      '\n\n'

    typeDefinition +=
      'export type Category2 = ' +
      Array.from(uniqueValues.Category2)
        .sort()
        .map(v => `'${v}'`)
        .join(' | ') +
      '\n\n'

    typeDefinition +=
      'export type Category3 = ' +
      Array.from(uniqueValues.Category3)
        .sort()
        .map(v => `'${v}'`)
        .join(' | ') +
      '\n\n'

    const validStages = ['Final', 'In Quality Control', 'Bug', 'Art Updates']

    typeDefinition += `export type Stage = ${validStages.map(v => `'${v}'`).join(' | ')}\n\n`

    interface TraitData {
      id: number
      name: string
      stage: string
      category1: string
      category2: string
      category3?: string
      zoomArea?: string
      searchableTags: string[]
      devTags: string[]
      frontIndex?: number
      backIndex?: number
      basicFrontFile?: string
      armBehindBackFrontFile?: string
      chibiBasicFrontFile?: string
      waveFrontFile?: string
      hipFrontFile?: string
      peaceFrontFile?: string
      holdingFrontFile?: string
      basicBackFile?: string
      armBehindBackBackFile?: string
      chibiBasicBackFile?: string
      waveBackFile?: string
      hipBackFile?: string
      peaceBackFile?: string
      holdingBackFile?: string
    }

    typeDefinition += `export interface TraitData {
      id: number
      name: string
      stage: Stage
      category1: Category1
      category2: Category2
      category3?: Category3
      zoomArea?: ZoomArea
      searchableTags: string[]
      devTags: string[]
      frontIndex?: number
      backIndex?: number
      basicFrontFile?: string
      armBehindBackFrontFile?: string
      chibiBasicFrontFile?: string
      waveFrontFile?: string
      hipFrontFile?: string
      peaceFrontFile?: string
      holdingFrontFile?: string
      basicBackFile?: string
      armBehindBackBackFile?: string
      chibiBasicBackFile?: string
      waveBackFile?: string
      hipBackFile?: string
      peaceBackFile?: string
      holdingBackFile?: string
    }\n\n`

    // Filter and sort the data
    const validItems = jsonData
      .filter((item: any) => {
        const isValid =
          item['Name'] &&
          validStages.includes(item['Stage']) &&
          item['Category 1 Old'] &&
          item['Category 1 Old'] !== 'Hidden'

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
        const selectionsCompare = compareNullable(a['Category 1 Old'], b['Category 1 Old'])
        if (selectionsCompare !== 0) {
          return selectionsCompare
        }

        // Then by Header Category
        const headerCompare = compareNullable(a['Category 2'], b['Category 2'])
        if (headerCompare !== 0) {
          return headerCompare
        }

        // Then by Secondary Category
        const secondaryCompare = compareNullable(a['Category 3'], b['Category 3'])
        if (secondaryCompare !== 0) {
          return secondaryCompare
        }

        // Finally by Label
        return compareNullable(a['Name'], b['Name'])
      })

    console.log(`Found ${validItems.length} valid items out of ${jsonData.length} total items`)

    // Create the data
    let dataExport = 'const traitsData: TraitData[] = '

    // Add each item to the data export
    const traitDatas: TraitData[] = validItems.map((item: any) => {
      return {
        id: item['ID'],
        name: item['Name'],
        stage: item['Stage'],
        category1: item['Category 1 Old'],
        category2: item['Category 2'],
        category3: item['Category 3'] || undefined,
        searchableTags: item['Searchable Tags'],
        devTags: item['Dev Tags'],
        frontIndex: item['Front Index'] || undefined,
        backIndex: item['Back Index'] || undefined,
        basicFrontFile: item['Basic Front File']?.name || undefined,
        armBehindBackFrontFile: item['Arm Behind Back Front File']?.name || undefined,
        chibiBasicFrontFile: item['Chibi Basic Front File']?.name || undefined,
        waveFrontFile: item['Wave Front File']?.name || undefined,
        hipFrontFile: item['Hip Front File']?.name || undefined,
        peaceFrontFile: item['Peace Front File']?.name || undefined,
        holdingFrontFile: item['Holding Front File']?.name || undefined,
        basicBackFile: item['Basic Back File']?.name || undefined,
        armBehindBackBackFile: item['Arm Behind Back Back File']?.name || undefined,
        chibiBasicBackFile: item['Chibi Basic Back File']?.name || undefined,
        waveBackFile: item['Wave Back File']?.name || undefined,
        hipBackFile: item['Hip Back File']?.name || undefined,
        peaceBackFile: item['Peace Back File']?.name || undefined,
        holdingBackFile: item['Holding Back File']?.name || undefined,
      }
    })

    dataExport += JSON.stringify(traitDatas, null, 2) + '\n\n'

    dataExport +=
      'export const getTraitsData = (all?: boolean) => traitsData.filter(t => all ? true : t.stage === "Final");\n'

    // Write the TypeScript file
    writeToFile(typeDefinition + dataExport, PATHS.TRAITS_TS_FILE)

    console.log(`Successfully converted JSON data to TypeScript`)
    console.log(`TypeScript file saved to: ${PATHS.TRAITS_TS_FILE}`)
  } catch (error) {
    console.error('Error converting JSON to TypeScript:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  validateEnvVars(['NOTION_TOKEN', 'NOTION_TRAITS_DATABASE_ID'])
  // Run the download function and then convert to TypeScript
  ;(async () => {
    await cleanFiles([PATHS.TRAITS_DATA_FILE, PATHS.TRAITS_TS_FILE])
    const jsonFilePath = await downloadNotionTable(process.env.NOTION_TRAITS_DATABASE_ID as string)
    convertJsonToTypeScript(jsonFilePath)
  })()
}
