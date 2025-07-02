import {PATHS} from './constants'
import {extractPropertyValue, fetchAllPages, validateEnvVars, writeJsonToFile} from './notion-utils'

interface CategoryRecord {
  id: number
  categoryType: string
  categoryName: string
  icon: {url: string; name: string}
}

async function extractCategories() {
  const rawPages = await fetchAllPages(process.env.NOTION_CATEGORY_DATABASE_ID!)

  const records: CategoryRecord[] = rawPages.map(page => {
    const props = page.properties
    console.log(props)

    const id = Number(extractPropertyValue(props.ID))
    const categoryType = String(extractPropertyValue(props['Category Type']))
    const categoryName = String(extractPropertyValue(props['Category Name']))
    const icon = (extractPropertyValue(props.Icon) as {
      url: string
      name: string
    }) || {
      url: '',
      name: '',
    }

    return {id, categoryType, categoryName, icon}
  })

  writeJsonToFile(records, PATHS.CATEGORIES_DATA_FILE)

  console.log(`Extracted ${records.length} categories → ${PATHS.CATEGORIES_DATA_FILE}`)
}

if (require.main === module) {
  validateEnvVars(['NOTION_TOKEN', 'NOTION_CATEGORY_DATABASE_ID'])
  extractCategories().catch(err => {
    console.error(err)
    process.exit(1)
  })
}
