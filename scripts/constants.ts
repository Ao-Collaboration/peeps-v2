import * as path from 'path'

export const PATHS = {
  DATA_DIR: path.join(process.cwd(), 'data'),
  NOTION_DATA_FILE: path.join(process.cwd(), 'data', 'notion-data.json'),
  TRAITS_DIR: path.join(process.cwd(), 'public', 'traits'),
  TRAITS_TS_FILE: path.join(process.cwd(), 'src', 'data', 'traits.ts'),
} as const

export const IGNORED_FIELDS = new Set([
  'Notes / Bugs',
  'Old Category',
  'Name Suggestions',
  'Assigned To',
  'Type',
])

export const ALWAYS_DEFINED_FIELDS = new Set([
  'ID',
  'Name',
  'Stage',
  'Label',
  'Category 1',
  'Category 2',
])
