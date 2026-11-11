import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useAccount } from '../lib/AccountContext';
import { accounts, hasErrors, validate, type FieldErrors, type Member } from '../lib/accounts';
import { content } from '../content';
import WaitlistGate from '../components/WaitlistGate';
import { fill } from '../lib/fill';
import { eyebrow, primaryButton, sectionTitle } from '../lib/styles';

const copy = content.account;
// Server mode swaps in its own wording where it differs (sign-in by emailed
// code, data held by AWDEA rather than on this device). Both branches carry
// every key, so either mode can read any of them.
const t = accounts.requiresEmail ? { ...copy, ...copy.cloud } : { ...copy.cloud, ...copy };

const fieldClass =
  'mt-2 w-full min-h-12 rounded-xl border-2 border-[var(--color-brand)]/30 bg-[var(--color-paper)] px-4 text-base text-[var(--color-body-strong)] focus:border-[var(--color-brand)] focus:outline-none';
const labelClass = 'block text-base font-semibold text-[var(--color-body-strong)]';
const hintClass = 'mt-1 text-base text-[var(--color-body)] md:text-sm';
const errorClass = 'mt-2 text-base font-semibold text-red-800';

/**
 * Name, email and phone fields, with errors tied to their inputs.
 *
 * Errors are announced through role="alert" and linked with aria-describedby,
 * so a screen reader user hears what is wrong and which field it belongs to,
 * without having to hunt for the red text.
 */
const MemberFields = ({
  defaults,
  errors,
  disabled,
  emailLocked,
}: {
  defaults?: Partial<Member>;
  errors: FieldErrors;
  disabled?: boolean;
  /** The address is where sign-in codes go, so it cannot be edited here. */
  emailLocked?: boolean;
}) => (
  <>
    <div className="mb-6">
      <label htmlFor="member-name" className={labelClass}>
        Name or username
      </label>
      <p id="member-name-hint" className={hintClass}>
        {copy.nameHint}
      </p>
      <input
        id="member-name"
        name="name"
        type="text"
        autoComplete="name"
        defaultValue={defaults?.name ?? ''}
        disabled={disabled}
        aria-describedby={`member-name-hint${errors.name ? ' member-name-error' : ''}`}
        aria-invalid={!!errors.name}
        className={fieldClass}
      />
      {errors.name && (
        <p id="member-name-error" role="alert" className={errorClass}>
          {errors.name}
        </p>
      )}
    </div>

    <div className="mb-6">
      <label htmlFor="member-email" className={labelClass}>
        Email address
      </label>
      <p id="member-email-hint" className={hintClass}>
        {emailLocked ? t.emailLockedHint : t.emailHint}
      </p>
      <input
        id="member-email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        spellCheck={false}
        defaultValue={defaults?.email ?? ''}
        disabled={disabled}
        readOnly={emailLocked}
        aria-readonly={emailLocked || undefined}
        aria-describedby={`member-email-hint${errors.email ? ' member-email-error' : ''}`}
        aria-invalid={!!errors.email}
        className={fieldClass}
      />
      {errors.email && (
        <p id="member-email-error" role="alert" className={errorClass}>
          {errors.email}
        </p>
      )}
    </div>

    <div className="mb-6">
      <label htmlFor="member-phone" className={labelClass}>
        Phone number
      </label>
      <p id="member-phone-hint" className={hintClass}>
        {t.phoneHint}
      </p>
      <input
        id="member-phone"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        defaultValue={defaults?.phone ?? ''}
        disabled={disabled}
        aria-describedby={`member-phone-hint${errors.phone ? ' member-phone-error' : ''}`}
        aria-invalid={!!errors.phone}
        className={fieldClass}
      />
      {errors.phone && (
        <p id="member-phone-error" role="alert" className={errorClass}>
          {errors.phone}
        </p>
      )}
    </div>

    {errors.contact && (
      <p role="alert" className={`${errorClass} mb-6`}>
        {errors.contact}
      </p>
    )}
  </>
);

const readForm = (form: HTMLFormElement) => {
  const data = new FormData(form);
  return {
    name: String(data.get('name') ?? ''),
    email: String(data.get('email') ?? ''),
    phone: String(data.get('phone') ?? ''),
  };
};

/**
 * Second step of signing in by emailed code.
 *
 * Focus moves to the code box on arrival, since the previous form has just
 * vanished and a keyboard or screen reader user would otherwise be left
 * nowhere. Errors are announced and linked to the box, as elsewhere.
 */
const CodeStep = ({
  email,
  onVerified,
  onResend,
  onBack,
}: {
  email: string;
  onVerified: () => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
}) => {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInfo(null);
    const code = String(new FormData(event.currentTarget).get('code') ?? '').replace(/\s/g, '');
    if (!code) {
      setError('Please type the code from your email.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await accounts.verify(email, code);
      await onVerified();
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const again = async () => {
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      await onResend();
      setInfo(t.resent);
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h3 className="mb-4 text-xl font-bold text-[var(--color-body-strong)]">{t.codeHeading}</h3>
      <form onSubmit={submit} noValidate aria-label={t.codeHeading}>
        <div className="mb-6">
          <label htmlFor="code-input" className={labelClass}>
            {t.codeLabel}
          </label>
          <p id="code-hint" className={hintClass}>
            {fill(t.codeHint, { email })}
          </p>
          <input
            id="code-input"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            spellCheck={false}
            autoFocus
            disabled={busy}
            aria-describedby={`code-hint${error ? ' code-error' : ''}`}
            aria-invalid={!!error}
            className={fieldClass}
          />
          {error && (
            <p id="code-error" role="alert" className={errorClass}>
              {error}
            </p>
          )}
          {info && (
            <p role="status" className="mt-2 text-base font-semibold text-[var(--color-body-strong)]">
              {info}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button type="submit" disabled={busy} className={`${primaryButton} w-full disabled:opacity-60 sm:w-auto`}>
            {busy ? 'Checking…' : t.codeButton}
          </button>
          <button
            type="button"
            onClick={again}
            disabled={busy}
            className="min-h-12 w-full rounded-full border-2 border-[var(--color-body-strong)] px-6 font-semibold text-[var(--color-body-strong)] disabled:opacity-60 sm:w-auto"
          >
            {t.resendButton}
          </button>
          <button
            type="button"
            onClick={onBack}
            disabled={busy}
            className="min-h-12 w-full rounded-full px-6 font-semibold text-[var(--color-brand-deep)] underline underline-offset-4 disabled:opacity-60 sm:w-auto"
          >
            {t.changeEmailButton}
          </button>
        </div>
      </form>
    </div>
  );
};
/** Shown to every signed-out visitor, and to anyone who signed in on a device
 *  that had no account yet. */
const SignedOut = ({ onChange }: { onChange: () => Promise<void> }) => {
  const [mode, setMode] = useState<'create' | 'signin'>('create');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Set once a code has been emailed; shows the code form instead of the tabs.
  const [codeFor, setCodeFor] = useState<string | null>(null);
  const resend = useRef<() => Promise<void>>(async () => {});

  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    const input = readForm(event.currentTarget);
    const found = validate(input, { requireEmail: accounts.requiresEmail });
    setErrors(found);
    if (hasErrors(found)) return;
    setBusy(true);
    try {
      const step = await accounts.register(input);
      if (step.kind === 'code-sent') {
        // Remember how to ask again, so "send a new code" works for someone
        // whose account does not exist yet as well as for a returning member.
        resend.current = async () => void (await accounts.register(input));
        setCodeFor(step.email);
      } else {
        await onChange();
      }
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const submitSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim();
    // Only the email rule applies here; the name check is a placeholder so
    // validate() has something to pass.
    const found: FieldErrors = {};
    const emailError = validate({ name: 'x', email }).email;
    if (emailError) found.email = emailError;
    if (!email) found.email = 'Please enter the email address on your account.';
    setErrors(found);
    if (hasErrors(found)) return;
    setBusy(true);
    try {
      const step = await accounts.signIn(email);
      if (step.kind === 'code-sent') {
        resend.current = async () => void (await accounts.signIn(email));
        setCodeFor(step.email);
      } else {
        await onChange();
      }
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const tabClass = (active: boolean) =>
    `min-h-12 flex-1 rounded-full px-5 text-base font-semibold transition-colors ${
      active
        ? 'bg-[var(--color-brand)] text-white'
        : 'border-2 border-[var(--color-brand)]/30 text-[var(--color-body-strong)]'
    }`;

  if (codeFor) {
    return (
      <CodeStep
        email={codeFor}
        onVerified={onChange}
        onResend={() => resend.current()}
        onBack={() => {
          setCodeFor(null);
          setErrors({});
        }}
      />
    );
  }

  return (
    <div>
      {/* A real pair of tabs would need arrow-key handling; two buttons that
          each toggle a visible form is simpler and fully keyboard-reachable. */}
      <div className="mb-8 flex gap-3" role="group" aria-label="Choose what to do">
        <button
          type="button"
          aria-pressed={mode === 'create'}
          onClick={() => {
            setMode('create');
            setErrors({});
            setNotice(null);
          }}
          className={tabClass(mode === 'create')}
        >
          Create an account
        </button>
        <button
          type="button"
          aria-pressed={mode === 'signin'}
          onClick={() => {
            setMode('signin');
            setErrors({});
            setNotice(null);
          }}
          className={tabClass(mode === 'signin')}
        >
          Sign in
        </button>
      </div>

      {notice && (
        <p role="alert" className="mb-6 rounded-xl border-2 border-red-800/40 bg-red-50 p-4 text-base font-semibold text-red-900">
          {notice}
        </p>
      )}

      {mode === 'create' ? (
        <form onSubmit={submitCreate} noValidate aria-label="Create an account">
          <MemberFields errors={errors} disabled={busy} />
          <button type="submit" disabled={busy} className={`${primaryButton} w-full disabled:opacity-60 sm:w-auto`}>
            {busy ? 'Saving…' : 'Create my account'}
          </button>
        </form>
      ) : (
        <form onSubmit={submitSignIn} noValidate aria-label="Sign in">
          <div className="mb-6">
            <label htmlFor="signin-email" className={labelClass}>
              Email address
            </label>
            <p id="signin-email-hint" className={hintClass}>
              {t.signInEmailHint}
            </p>
            <input
              id="signin-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              disabled={busy}
              aria-describedby={`signin-email-hint${errors.email ? ' signin-email-error' : ''}`}
              aria-invalid={!!errors.email}
              className={fieldClass}
            />
            {errors.email && (
              <p id="signin-email-error" role="alert" className={errorClass}>
                {errors.email}
              </p>
            )}
          </div>
          <button type="submit" disabled={busy} className={`${primaryButton} w-full disabled:opacity-60 sm:w-auto`}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      )}
    </div>
  );
};

/** Shown to a signed-in member: their details, editable, plus sign-out and
 *  delete. */
const SignedIn = ({ member, onChange }: { member: Member; onChange: () => Promise<void> }) => {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    const input = readForm(event.currentTarget);
    const found = validate(input, { requireEmail: accounts.requiresEmail });
    setErrors(found);
    if (hasErrors(found)) return;
    setBusy(true);
    try {
      await accounts.update(member.id, input);
      await onChange();
      setNotice({ kind: 'ok', text: 'Your details have been saved.' });
    } catch (error) {
      setNotice({ kind: 'error', text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    await accounts.signOut();
    await onChange();
  };

  const remove = async () => {
    setBusy(true);
    try {
      await accounts.remove(member.id);
      await onChange();
    } catch (error) {
      setNotice({ kind: 'error', text: (error as Error).message });
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div>
      <p className="mb-8 text-lg text-[var(--color-body)]">
        Signed in as <span className="font-semibold text-[var(--color-body-strong)]">{member.name}</span>.
      </p>

      {notice && (
        <p
          role={notice.kind === 'error' ? 'alert' : 'status'}
          className={`mb-6 rounded-xl border-2 p-4 text-base font-semibold ${
            notice.kind === 'error'
              ? 'border-red-800/40 bg-red-50 text-red-900'
              : 'border-[var(--color-brand)]/40 bg-[var(--color-mist)] text-[var(--color-body-strong)]'
          }`}
        >
          {notice.text}
        </p>
      )}

      <form onSubmit={save} noValidate aria-label="Your details">
        <MemberFields
          defaults={member}
          errors={errors}
          disabled={busy}
          emailLocked={!accounts.canChangeEmail}
        />
        <button type="submit" disabled={busy} className={`${primaryButton} w-full disabled:opacity-60 sm:w-auto`}>
          Save my details
        </button>
      </form>

      <div className="mt-12 border-t border-[var(--color-brand)]/20 pt-8">
        <h3 className="mb-4 text-xl font-bold text-[var(--color-body-strong)]">{copy.signOutHeading}</h3>
        <p className="mb-4 text-base text-[var(--color-body)]">
          {t.signOutText}
        </p>
        <button
          type="button"
          onClick={signOut}
          disabled={busy}
          className="min-h-12 rounded-full border-2 border-[var(--color-body-strong)] px-6 font-semibold text-[var(--color-body-strong)] hover:bg-[var(--color-body-strong)] hover:text-white disabled:opacity-60"
        >
          Sign out
        </button>
      </div>

      <div className="mt-12 border-t border-[var(--color-brand)]/20 pt-8">
        <h3 className="mb-4 text-xl font-bold text-[var(--color-body-strong)]">{copy.deleteHeading}</h3>
        <p className="mb-4 text-base text-[var(--color-body)]">
          {t.deleteText}
        </p>
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
            className="min-h-12 rounded-full border-2 border-red-800 px-6 font-semibold text-red-900 hover:bg-red-50"
          >
            Delete my account…
          </button>
        ) : (
          <div role="group" aria-label="Confirm deleting your account" className="rounded-2xl border-2 border-red-800/40 bg-red-50 p-5">
            <p className="mb-4 text-base font-semibold text-red-900">
              {copy.deleteConfirm}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={remove}
                disabled={busy}
                className="min-h-12 rounded-full bg-red-800 px-6 font-semibold text-white hover:bg-red-900 disabled:opacity-60"
              >
                Yes, delete my account
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="min-h-12 rounded-full border-2 border-[var(--color-body-strong)] px-6 font-semibold text-[var(--color-body-strong)]"
              >
                Keep my account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Shown instead of the whole page while the account gate is on (see
 * content.waitlist.gates). The sign-up and sign-in forms are not rendered.
 *
 * This hides the page; it does not by itself stop someone calling the account
 * service directly. When real accounts go live, also switch off new sign-ups in
 * Supabase until the gate is opened.
 */
const AccountWaitlist = () => {
  const wl = content.waitlist.account;
  return (
    <>
      <section className="relative overflow-hidden bg-[var(--color-mist)] px-6 pt-32 pb-14 md:px-12 md:pt-40 md:pb-20">
        <div className="relative mx-auto max-w-2xl">
          <p className={`mb-4 ${eyebrow}`}>{wl.eyebrow}</p>
          <h1 className="mb-6 text-[clamp(2rem,7vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--color-body-strong)]">
            {wl.heading}
          </h1>
          <p className="text-lg leading-relaxed text-[var(--color-body)]">{wl.intro}</p>
        </div>
      </section>

      <section className="bg-[var(--color-paper)] px-6 py-14 md:px-12 md:py-20">
        <div className="mx-auto max-w-2xl">
          <WaitlistGate source="account" heading={wl.cardHeading} />
        </div>
      </section>
    </>
  );
};
const Account = () => {
  const { member, loading, refresh } = useAccount();
  if (content.waitlist.gates.account) return <AccountWaitlist />;

  return (
    <>
      <section className="relative overflow-hidden bg-[var(--color-mist)] px-6 pt-32 pb-14 md:px-12 md:pt-40 md:pb-20">
        <div className="relative mx-auto max-w-2xl">
          <p className={`mb-4 ${eyebrow}`}>{copy.eyebrow}</p>
          <h1 className="mb-6 text-[clamp(2rem,7vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--color-body-strong)]">
            {copy.heading}
          </h1>
          <p className="text-lg leading-relaxed text-[var(--color-body)]">
            {t.intro}
          </p>
        </div>
      </section>

      <section className="bg-[var(--color-paper)] px-6 py-14 md:px-12 md:py-20" aria-labelledby="account-heading">
        <div className="mx-auto max-w-2xl">
          <h2 id="account-heading" className={`mb-8 ${sectionTitle}`}>
            {member ? copy.headingSignedIn : copy.headingSignedOut}
          </h2>

          {/* Announced, so a screen reader user is told the page has settled
              instead of meeting a pause. */}
          <p aria-live="polite" className="sr-only">
            {loading ? 'Checking your account.' : ''}
          </p>

          {loading ? (
            <p className="text-lg text-[var(--color-body)]">Checking your account…</p>
          ) : member ? (
            <SignedIn member={member} onChange={refresh} />
          ) : (
            <SignedOut onChange={refresh} />
          )}

          <div className="mt-16 rounded-2xl border border-[var(--color-brand)]/20 bg-[var(--color-mist)] p-6">
            <h3 className="mb-3 text-lg font-bold text-[var(--color-body-strong)]">{copy.privacyHeading}</h3>
            <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-[var(--color-body)]">
              {t.privacyPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default Account;
