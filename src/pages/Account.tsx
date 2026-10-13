import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAccount } from '../lib/AccountContext';
import { accounts, hasErrors, validate, type FieldErrors, type Member } from '../lib/accounts';
import { eyebrow, primaryButton, sectionTitle } from '../lib/styles';

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
}: {
  defaults?: Partial<Member>;
  errors: FieldErrors;
  disabled?: boolean;
}) => (
  <>
    <div className="mb-6">
      <label htmlFor="member-name" className={labelClass}>
        Name or username
      </label>
      <p id="member-name-hint" className={hintClass}>
        What you would like us to call you. Your full name is fine, and so is a nickname.
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
        Optional if you give a phone number.
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
        Optional if you give an email. Include the area code.
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

/** Shown to every signed-out visitor, and to anyone who signed in on a device
 *  that had no account yet. */
const SignedOut = ({ onChange }: { onChange: () => Promise<void> }) => {
  const [mode, setMode] = useState<'create' | 'signin'>('create');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    const input = readForm(event.currentTarget);
    const found = validate(input);
    setErrors(found);
    if (hasErrors(found)) return;
    setBusy(true);
    try {
      await accounts.register(input);
      await onChange();
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
      await accounts.signIn(email);
      await onChange();
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
              The email you used when you created your account.
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
    const found = validate(input);
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
        <MemberFields defaults={member} errors={errors} disabled={busy} />
        <button type="submit" disabled={busy} className={`${primaryButton} w-full disabled:opacity-60 sm:w-auto`}>
          Save my details
        </button>
      </form>

      <div className="mt-12 border-t border-[var(--color-brand)]/20 pt-8">
        <h3 className="mb-4 text-xl font-bold text-[var(--color-body-strong)]">Sign out</h3>
        <p className="mb-4 text-base text-[var(--color-body)]">
          Signs this browser out. Your details stay saved on this device.
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
        <h3 className="mb-4 text-xl font-bold text-[var(--color-body-strong)]">Delete my account</h3>
        <p className="mb-4 text-base text-[var(--color-body)]">
          This removes your name, email, phone number and raffle entries from this device. It cannot be undone.
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
              Are you sure? Your account and details will be deleted.
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

const Account = () => {
  const { member, loading, refresh } = useAccount();

  return (
    <>
      <section className="relative overflow-hidden bg-[var(--color-mist)] px-6 pt-32 pb-14 md:px-12 md:pt-40 md:pb-20">
        <div className="relative mx-auto max-w-2xl">
          <p className={`mb-4 ${eyebrow}`}>Members</p>
          <h1 className="mb-6 text-[clamp(2rem,7vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--color-body-strong)]">
            Your account
          </h1>
          <p className="text-lg leading-relaxed text-[var(--color-body)]">
            Create an account to keep your details with AWDEA. You only need an email address or a phone
            number, and you can give both.
          </p>
        </div>
      </section>

      <section className="bg-[var(--color-paper)] px-6 py-14 md:px-12 md:py-20" aria-labelledby="account-heading">
        <div className="mx-auto max-w-2xl">
          <h2 id="account-heading" className={`mb-8 ${sectionTitle}`}>
            {member ? 'Your details' : 'Join AWDEA'}
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
            <h3 className="mb-3 text-lg font-bold text-[var(--color-body-strong)]">How we look after your details</h3>
            <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-[var(--color-body)]">
              <li>We only ask for what we need: a name or username, and an email or phone number.</li>
              <li>We do not ask for anything about your disability.</li>
              <li>Credit card payments are handled by Stripe. Card details never reach AWDEA.</li>
              <li>You can change or delete your details at any time from this page.</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default Account;
