import type { User } from "./types";

interface ImportMetaEnv {
  readonly PUBLIC_DIRECTUS_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  namespace App {
    interface Locals extends Record<string, any> {
      user?: User | null;
    }
  }
}