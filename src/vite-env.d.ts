/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GCAL_ID?: string;
  readonly VITE_GCAL_KEY?: string;
  /** Google Drive folder the gallery reads from. */
  readonly VITE_GDRIVE_FOLDER?: string;
  /** Key cleared for the Drive API. Falls back to VITE_GCAL_KEY if unset. */
  readonly VITE_GDRIVE_KEY?: string;
  /** 'local' (default) keeps accounts in this browser. 'supabase' is not wired yet. */
  readonly VITE_ACCOUNTS_BACKEND?: 'local' | 'supabase';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
