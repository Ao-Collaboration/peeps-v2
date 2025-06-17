import * as path from 'path'

export const PATHS = {
  DATA_DIR: path.join(process.cwd(), 'data'),
  TRAITS_DATA_FILE: path.join(process.cwd(), 'data', 'traits.json'),
  CATEGORIES_DATA_FILE: path.join(process.cwd(), 'data', 'categories.json'),
  TRAITS_DIR: path.join(process.cwd(), 'public', 'traits'),
  ICONS_DIR: path.join(process.cwd(), 'public', 'icons'),
  TRAITS_TS_FILE: path.join(process.cwd(), 'src', 'data', 'traits.ts'),
} as const
