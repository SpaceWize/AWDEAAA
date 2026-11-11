import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { content } from '../content';
import { fill } from '../lib/fill';
import { primaryButton } from '../lib/styles';
import {
  isWaitlistConfigured,
  joinWaitlist,
  TURNSTILE_SITE_KEY,
  WaitlistError,
  type WaitlistFailure,
  type WaitlistResult,
} from '../lib/waitlist';
import Turnstile from './Turnstile';

const copy = content.waitlist.form;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const messageFor = (reason: WaitlistFailure) => {
  switch (reason) {
    case 'invalid_email':
      return copy.errorInvalid;
    case 'bot':
      return copy.errorBotCheck;
    case 'network':
      return copy.errorNetwork;
    case 'not_configured':
      return copy.errorNotConnected;
    default:
      return copy.errorServer;
  }
};

interface WaitlistGateProps {
  /** Which page this sits on. Saved beside the email in the Sheet. */
  source: 'donate' | 'account';
  heading: string;
  /** Anything to show under the form, such as another way to get in touch. */
  children?: ReactNode;
}

/**
 * A waitlist sign-up card: one email field, a bot check, and a clear result.
 *
 * Bot protection comes in layers, because each stops what the others miss:
 *  1. Cloudflare Turnstile, checked on the server, not just in this page.
 *  2. A hidden "website" field that a person never sees and a form-filling
 *     script usually completes.
 *  3. How long the form was open. A person takes more than a couple of
 *     seconds; the script rejects anything faster.
 *
 * Accessibility: the field has a visible label and hint, every error is
 * announced and linked to the field, and on success focus moves to the
 * confirmation so a screen reader user hears it instead of silence.
 */
const WaitlistGate = ({ source, heading, children }: WaitlistGateProps) => {
  const [startedAt] = useState(() => Date.now());
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [checkBlocked, setCheckBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ result: WaitlistResult; email: string } | null>(null);

  const emailInput = useRef<HTMLInputElement>(null);
  const confirmation = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (done) confirmation.current?.focus();
  }, [done]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();

    const refuse = (message: string, focusEmail = true) => {
      setError(message);
      if (focusEmail) emailInput.current?.focus();
    };

    if (!email) return refuse(copy.errorEmpty);
    if (!EMAIL.test(email)) return refuse(copy.errorInvalid);
    if (!isWaitlistConfigured) return refuse(copy.errorNotConnected, false);
    if (checkBlocked) return refuse(copy.errorCheckBlocked, false);
    if (!token) return refuse(copy.errorWaitForCheck, false);

    setBusy(true);
    try {
      const result = await joinWaitlist({
        email,
        token,
        source,
        startedAt,
        website: String(data.get('website') ?? ''),
      });
      setDone({ result, email });
    } catch (problem) {
      setError(messageFor(problem instanceof WaitlistError ? problem.reason : 'server'));
      // A Turnstile token can be used once. Get a fresh one for the next try.
      setResetKey((k) => k + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border-2 border-[var(--color-brand)]/25 bg-[var(--color-paper)] p-6 shadow-xl shadow-violet-900/10 md:p-8">
      <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-[var(--color-body-strong)]">
        {heading}
      </h2>

      {done ? (
        <div
          ref={confirmation}
          tabIndex={-1}
          role="status"
          className="rounded-2xl border-2 border-[var(--color-brand)]/40 bg-[var(--color-mist)] p-5 outline-none"
        >
          <p className="mb-2 text-xl font-bold text-[var(--color-body-strong)]">
            {done.result === 'already' ? copy.alreadyHeading : copy.successHeading}
          </p>
          <p className="text-base leading-relaxed text-[var(--color-body)]">
            {fill(done.result === 'already' ? copy.alreadyText : copy.successText, {
              email: done.email,
            })}
          </p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate aria-label={heading}>
          <div className="mb-5">
            <label
              htmlFor={`waitlist-email-${source}`}
              className="block text-base font-semibold text-[var(--color-body-strong)]"
            >
              {copy.emailLabel}
            </label>
            <p
              id={`waitlist-hint-${source}`}
              className="mt-1 text-base text-[var(--color-body)] md:text-sm"
            >
              {copy.emailHint}
            </p>
            <input
              ref={emailInput}
              id={`waitlist-email-${source}`}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              disabled={busy}
              aria-describedby={`waitlist-hint-${source}${error ? ` waitlist-error-${source}` : ''}`}
              aria-invalid={!!error}
              className="mt-2 min-h-12 w-full rounded-xl border-2 border-[var(--color-brand)]/30 bg-[var(--color-paper)] px-4 text-base text-[var(--color-body-strong)] focus:border-[var(--color-brand)] focus:outline-none"
            />
            {error && (
              <p
                id={`waitlist-error-${source}`}
                role="alert"
                className="mt-2 text-base font-semibold text-red-800"
              >
                {error}
              </p>
            )}
          </div>

          {/* The trap. Positioned off-screen rather than display:none, because
              some form-filling scripts skip fields that are not rendered.
              Hidden from assistive technology and removed from the tab order,
              so no real visitor can reach it. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Leave this field empty
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          {TURNSTILE_SITE_KEY && (
            <div className="mb-5">
              <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                resetKey={resetKey}
                onToken={(value) => {
                  setToken(value);
                  if (value) setCheckBlocked(false);
                }}
                onProblem={() => setCheckBlocked(true)}
              />
              {!token && !checkBlocked && (
                <p aria-live="polite" className="text-base text-[var(--color-body)] md:text-sm">
                  {copy.checking}
                </p>
              )}
              {checkBlocked && (
                <p role="alert" className="mt-2 text-base font-semibold text-red-800">
                  {copy.errorCheckBlocked}
                </p>
              )}
            </div>
          )}

          <p className="mb-5 text-base leading-relaxed text-[var(--color-body)] md:text-sm">
            {copy.consent}
          </p>

          <button
            type="submit"
            disabled={busy}
            className={`${primaryButton} w-full disabled:opacity-60 sm:w-auto`}
          >
            {busy ? copy.sending : copy.button}
          </button>
        </form>
      )}

      {children}
    </div>
  );
};

export default WaitlistGate;
