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
  /** Supabase project address, e.g. https://abcdefgh.supabase.co. Public. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase PUBLISHABLE key (sb_publishable_...). Public. Never a secret key. */
  readonly VITE_SUPABASE_KEY?: string;
  /** Web app address of the Google Apps Script that receives waitlist sign-ups. Public. */
  readonly VITE_WAITLIST_URL?: string;
  /** Cloudflare Turnstile SITE key (public). Never the secret key. */
  readonly VITE_TURNSTILE_SITEKEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
