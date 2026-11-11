import { useEffect, useRef } from 'react';

/**
 * Cloudflare Turnstile: the "are you a person" check.
 *
 * Chosen over image-puzzle CAPTCHAs because most visitors never see a
 * challenge at all, and where one is needed it is built to work with screen
 * readers and keyboards. `interaction-only` keeps the widget invisible unless
 * Cloudflare genuinely needs the visitor to do something.
 *
 * The script is fetched from Cloudflare only when a page with this widget is
 * opened, so the rest of the site makes no request to Cloudflare.
 */

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: 'light' | 'dark' | 'auto';
      size?: 'normal' | 'flexible' | 'compact';
      appearance?: 'always' | 'execute' | 'interaction-only';
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
    },
  ) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let loading: Promise<void> | null = null;

const loadScript = (): Promise<void> => {
  if (window.turnstile) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      // Allow a later attempt, e.g. after the visitor turns off a blocker.
      loading = null;
      reject(new Error('Turnstile could not load'));
    };
    document.head.appendChild(script);
  });
  return loading;
};

interface TurnstileProps {
  siteKey: string;
  /** Called with a token when the check passes, and with null when it expires. */
  onToken: (token: string | null) => void;
  /** Called if the widget cannot load or the check errors out. */
  onProblem: () => void;
  /** Change this number to throw the old token away and run a fresh check. */
  resetKey: number;
}

const Turnstile = ({ siteKey, onToken, onProblem, resetKey }: TurnstileProps) => {
  const holder = useRef<HTMLDivElement>(null);
  // Held in refs so the widget is not torn down every time the parent renders.
  const tokenCallback = useRef(onToken);
  const problemCallback = useRef(onProblem);
  tokenCallback.current = onToken;
  problemCallback.current = onProblem;

  useEffect(() => {
    const node = holder.current;
    if (!node) return;
    let widgetId: string | undefined;
    let cancelled = false;

    tokenCallback.current(null);
    loadScript()
      .then(() => {
        if (cancelled || !window.turnstile) return;
        widgetId = window.turnstile.render(node, {
          sitekey: siteKey,
          theme: 'light',
          size: 'flexible',
          appearance: 'interaction-only',
          callback: (token) => tokenCallback.current(token),
          'expired-callback': () => tokenCallback.current(null),
          'error-callback': () => problemCallback.current(),
        });
      })
      .catch(() => {
        if (!cancelled) problemCallback.current();
      });

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey, resetKey]);

  return <div ref={holder} />;
};

export default Turnstile;
