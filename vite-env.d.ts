/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAYMENT_BACKEND_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
