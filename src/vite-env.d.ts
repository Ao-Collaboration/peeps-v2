/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

interface ImportMetaEnv {
  VITE_WEBHOOKS_URL: string
}

interface ImportMeta {
  env: ImportMetaEnv
}
