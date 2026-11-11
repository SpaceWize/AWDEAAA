/**
 * Waitlist sign-ups, sent to a Google Apps Script attached to AWDEA's Sheet.
 * See google-apps-script/waitlist.gs for the other half.
 *
 * The browser never writes to the Sheet itself. It posts the email address to
 * the script, which decides whether to accept it. The script's address can be
 * found by anyone who reads the page, so the script treats every request as
 * untrusted: a hidden trap field, a minimum fill time, a flood limit and checks
 * on the address itself all live there, out of the visitor's reach.
 *
 * Cloudflare Turnstile is optional. If a site key is set, the page shows the
 * check and sends its token, and the script verifies it with Cloudflare using a
 * secret that lives only in the script's own settings. If no site key is set,
 * none of that is used.
 */

const SCRIPT_URL = import.meta.env.VITE_WAITLIST_URL as string | undefined;

/**
 * The Turnstile SITE key (public), or empty to run without Cloudflare. The
 * matching SECRET key goes only in the script's own settings.
 */
export const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITEKEY as string | undefined) || undefined;

/** Only the script address is needed. The Turnstile key is an optional extra. */
export const isWaitlistConfigured = Boolean(SCRIPT_URL);

export type WaitlistResult = 'joined' | 'already';

export type WaitlistFailure = 'invalid_email' | 'bot' | 'network' | 'server' | 'not_configured';

export class WaitlistError extends Error {
  reason: WaitlistFailure;
  constructor(reason: WaitlistFailure) {
    super(reason);
    this.reason = reason;
  }
}

export interface WaitlistRequest {
  email: string;
  /** The Turnstile token proving the visitor passed the check, if Turnstile is on. */
  token: string | null;
  /** Which page the visitor signed up from, saved beside the email. */
  source: 'donate' | 'account';
  /** When the form appeared. A person takes a moment; a script does not. */
  startedAt: number;
  /** A hidden field a real visitor never sees. Anything in it means a bot. */
  website: string;
}

const TIMEOUT_MS = 20000;

export const joinWaitlist = async (request: WaitlistRequest): Promise<WaitlistResult> => {
  if (!SCRIPT_URL) throw new WaitlistError('not_configured');

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(SCRIPT_URL, {
      method: 'POST',
      // text/plain keeps this a "simple" request. Google Apps Script cannot
      // answer the pre-flight check that application/json would trigger.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        email: request.email,
        token: request.token ?? '',
        source: request.source,
        elapsedMs: Date.now() - request.startedAt,
        website: request.website,
      }),
      signal: controller.signal,
    });
  } catch {
    throw new WaitlistError('network');
  } finally {
    window.clearTimeout(timer);
  }

  const data = (await response.json().catch(() => null)) as
    | { ok?: boolean; duplicate?: boolean; error?: string }
    | null;
  if (!data) throw new WaitlistError('server');

  if (data.ok) return data.duplicate ? 'already' : 'joined';
  if (data.error === 'invalid_email') throw new WaitlistError('invalid_email');
  if (data.error === 'bot_check_failed') throw new WaitlistError('bot');
  throw new WaitlistError('server');
};
