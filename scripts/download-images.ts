import * as fs from 'fs'
import * as path from 'path'

import {PATHS} from './constants'

function readJsonFile(jsonFilePath: string) {
  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'))
  if (jsonData.length === 0) {
    console.error('No data found in the JSON file')
    return
  }
  return jsonData
}

async function withCleanImageFolders(fn: () => Promise<void>) {
  // Temporarily save public/traits/Hidden/Skin/Basic.svg
  const tempSavePath = path.join(PATHS.TRAITS_DIR, 'Hidden', 'Skin', 'Basic.svg')
  const basicSvg = fs.readFileSync(tempSavePath, 'utf8')

  if (fs.existsSync(PATHS.TRAITS_DIR)) {
    fs.rmSync(PATHS.TRAITS_DIR, {recursive: true})
  }

  await fn()

  // Restore public/traits/Hidden/Skin/Basic.svg
  fs.mkdirSync(path.dirname(tempSavePath), {recursive: true})
  fs.writeFileSync(tempSavePath, basicSvg)
}

/**
 * Downloads all files from the Notion data JSON file.
 */
async function downloadFiles() {
  const jsonData = readJsonFile(PATHS.NOTION_DATA_FILE)

  for (const row of jsonData) {
    for (const key in row) {
      if (typeof row[key] === 'object' && row[key] !== null) {
        const file = row[key]
        const fileUrl = file.url
        const fileName = file.name

        const poseName = key.split(' ').slice(0, -2).join(' ')

        if (fileName && fileUrl) {
          console.log(`Downloading ${fileName} for ${poseName} pose`)
          // Build the folder path
          const folders = [row['Category 1'], row['Category 2'], row.Name, poseName].filter(Boolean)
          const folderPath = path.join(PATHS.TRAITS_DIR, ...folders)
          if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, {recursive: true})
          }

          // Download the file
          const response = await fetch(fileUrl)
          const blob = await response.blob()
          const filePath = path.join(folderPath, fileName)
          fs.writeFileSync(filePath, Buffer.from(await blob.arrayBuffer()))
        }
      }
    }
  }
}

if (require.main === module) {
  ;(async () => {
    await withCleanImageFolders(downloadFiles)
  })()
}
