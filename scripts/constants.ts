import * as path from 'path'

export const PATHS = {
  DATA_DIR: path.join(process.cwd(), 'data'),
  NOTION_DATA_FILE: path.join(process.cwd(), 'data', 'notion-data.json'),
  TRAITS_DIR: path.join(process.cwd(), 'public', 'traits'),
  TRAITS_TS_FILE: path.join(process.cwd(), 'src', 'data', 'traits.ts'),
} as const

export const IGNORED_FIELDS = new Set([
  'Comments',
  'Old Category',
  'Name Suggestions',
  'Assigned To',
  'Rename Guide',
  'Exclusions',
  'Related to Traits List (Exclusions)',
  'Rules for Devs',
  'Back File Name',
  'Front File Name',
])

export const ALWAYS_DEFINED_FIELDS = new Set(['Name', 'Stage', 'Label', 'Selections Category'])
