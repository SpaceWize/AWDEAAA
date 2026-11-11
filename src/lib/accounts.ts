/**
 * Member accounts, behind one small interface.
 *
 * Every page talks to `accounts` below, never to storage directly. Today that
 * is a browser-only store. When the site is moved to Supabase, only the
 * `createSupabaseBackend` function changes — the pages, the validation and the
 * tests do not.
 *
 * What the browser-only store can and cannot do — read this before trusting it:
 *  - Data lives in THIS browser on THIS device. A member who signs in on a
 *    phone will not see the account they made on a laptop.
 *  - Clearing site data, or a private window, erases it.
 *  - There is no password and no server, so nothing stops someone at a shared
 *    computer from opening a profile. Do not put anything here that you would
 *    not want the next person on that machine to read.
 *  - It exists to prove the flow end to end before real storage is connected.
 */

export interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface MemberInput {
  name: string;
  email?: string;
  phone?: string;
}

/**
 * What happens after asking to register or sign in. The browser-only store
 * finishes at once. The server store emails a code first, and the person is
 * only signed in once they type it back in.
 */
export type AuthStep =
  | { kind: 'signed-in'; member: Member }
  | { kind: 'code-sent'; email: string };

export interface AccountBackend {
  /** True when sign-in is by emailed code, so an email address is mandatory. */
  readonly requiresEmail: boolean;
  /** Whether the email on an existing account can be edited from the page. */
  readonly canChangeEmail: boolean;
  /** Who is signed in on this device, if anyone. */
  current(): Promise<Member | null>;
  /** Create a member. Rejects if the email or phone is already registered. */
  register(input: MemberInput): Promise<AuthStep>;
  /** Sign in by email. The browser store has no password; see the note above. */
  signIn(email: string): Promise<AuthStep>;
  /** Finish a `code-sent` step with the code from the email. */
  verify(email: string, code: string): Promise<Member>;
  /** Change the signed-in member's details. */
  update(id: string, input: MemberInput): Promise<Member>;
  signOut(): Promise<void>;
  /** Remove the member and everything attached to them. */
  remove(id: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Validation. Lives here, not on the page, so every backend enforces the same
// rules and a future server cannot be looser than the form.
// ---------------------------------------------------------------------------

export type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'contact', string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Keeps digits only, so "(604) 555-0100" and "604.555.0100" compare equal. */
export const normalisePhone = (raw: string) => raw.replace(/\D/g, '');

export const validate = (
  input: MemberInput,
  options: { requireEmail?: boolean } = {},
): FieldErrors => {
  const errors: FieldErrors = {};
  const name = input.name.trim();
  const email = input.email?.trim() ?? '';
  const phone = normalisePhone(input.phone ?? '');

  if (!name) errors.name = 'Please enter your name or a username.';
  else if (name.length > 80) errors.name = 'Please keep this under 80 characters.';

  if (options.requireEmail && !email) {
    errors.email = 'Please enter your email address. We email you a code to sign in.';
  } else if (email && !EMAIL.test(email)) {
    errors.email = 'That email address does not look right.';
  }

  if (phone && (phone.length < 10 || phone.length > 15)) {
    errors.phone = 'Please enter a phone number with area code, for example 604 555 0100.';
  }

  if (!options.requireEmail && !email && !phone && !errors.name) {
    errors.contact = 'Please give an email address, a phone number, or both.';
  }
  return errors;
};

export const hasErrors = (errors: FieldErrors) => Object.keys(errors).length > 0;

// ---------------------------------------------------------------------------
// Browser-only backend.
// ---------------------------------------------------------------------------

/** Trims what was typed and keeps phone numbers as digits only. */
const tidy = (input: MemberInput): MemberInput => ({
  name: input.name.trim(),
  email: input.email?.trim() || undefined,
  phone: normalisePhone(input.phone ?? '') || undefined,
});

const MEMBERS_KEY = 'awdea.members.v1';
const SESSION_KEY = 'awdea.session.v1';

const readMembers = (): Member[] => {
  try {
    const raw = window.localStorage.getItem(MEMBERS_KEY);
    return raw ? (JSON.parse(raw) as Member[]) : [];
  } catch {
    // Storage can be blocked (some privacy modes). Behave as an empty list
    // rather than crashing the page.
    return [];
  }
};

const writeMembers = (members: Member[]) => {
  try {
    window.localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  } catch {
    throw new Error('Your browser is not letting this site save information right now.');
  }
};

const sameEmail = (a?: string, b?: string) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

const samePhone = (a?: string, b?: string) =>
  !!a && !!b && normalisePhone(a) !== '' && normalisePhone(a) === normalisePhone(b);

const createLocalBackend = (): AccountBackend => {
  const findBy = (members: Member[], email?: string, phone?: string, exceptId?: string) =>
    members.find(
      (m) =>
        m.id !== exceptId &&
        (sameEmail(m.email, email) || samePhone(m.phone, phone)),
    );

  return {
    requiresEmail: false,
    canChangeEmail: true,

    async current() {
      const id = window.localStorage.getItem(SESSION_KEY);
      if (!id) return null;
      return readMembers().find((m) => m.id === id) ?? null;
    },

    async register(input) {
      const data = tidy(input);
      const members = readMembers();
      if (findBy(members, data.email, data.phone)) {
        throw new Error('An account already exists with that email or phone number. Try signing in instead.');
      }
      const member: Member = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
      };
      writeMembers([...members, member]);
      window.localStorage.setItem(SESSION_KEY, member.id);
      return { kind: 'signed-in', member };
    },

    async signIn(email) {
      const member = readMembers().find((m) => sameEmail(m.email, email));
      if (!member) {
        throw new Error('No account was found with that email address on this device.');
      }
      window.localStorage.setItem(SESSION_KEY, member.id);
      return { kind: 'signed-in', member };
    },

    async verify() {
      // The browser-only store never asks for a code.
      throw new Error('There is no code to check on this device.');
    },

    async update(id, input) {
      const data = tidy(input);
      const members = readMembers();
      if (findBy(members, data.email, data.phone, id)) {
        throw new Error('Another account already uses that email or phone number.');
      }
      const next = members.map((m) => (m.id === id ? { ...m, ...data } : m));
      writeMembers(next);
      const updated = next.find((m) => m.id === id);
      if (!updated) throw new Error('That account could not be found.');
      return updated;
    },

    async signOut() {
      window.localStorage.removeItem(SESSION_KEY);
    },

    async remove(id) {
      writeMembers(readMembers().filter((m) => m.id !== id));
      if (window.localStorage.getItem(SESSION_KEY) === id) {
        window.localStorage.removeItem(SESSION_KEY);
      }
    },
  };
};

// ---------------------------------------------------------------------------
// Server backend: Supabase.
//
// Members sign in with a code emailed to them, not a password. The database
// (supabase/schema.sql) lets each signed-in person read and change only their
// own row; that rule lives in Postgres, so it holds even if someone tampers
// with this page in their browser.
//
// The library is loaded on first use, so the browser-only mode ships none of
// it. Both values below are public by design: the publishable key can do only
// what the database rules allow. Never put a secret or service_role key in
// this site.
// ---------------------------------------------------------------------------

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY as string | undefined;

interface MemberRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

const MEMBER_COLUMNS = 'id,name,email,phone,created_at';

const fromRow = (row: MemberRow): Member => ({
  id: row.id,
  name: row.name,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
  createdAt: row.created_at,
});

/** Turns the library's technical errors into something a member can act on. */
const explain = (error: { message?: string; status?: number; code?: string }): Error => {
  const text = error.message ?? '';
  if (error.status === 429 || /rate limit|too many/i.test(text)) {
    return new Error('Too many attempts. Please wait a minute and try again.');
  }
  if (/not authorized/i.test(text)) {
    return new Error('We cannot send email to that address yet. Please contact AWDEA.');
  }
  if (/database error/i.test(text) || error.code === '23505') {
    return new Error(
      'We could not create that account. The email address or phone number may already be registered. Try signing in instead.',
    );
  }
  if (/expired|invalid|token/i.test(text)) {
    return new Error('That code did not work. It may have expired. Ask for a new one.');
  }
  if (/fetch|network/i.test(text)) {
    return new Error('We could not reach the server. Check your connection and try again.');
  }
  return new Error('Something went wrong. Please try again in a moment.');
};

const createSupabaseBackend = (): AccountBackend => {
  let pending: Promise<import('@supabase/supabase-js').SupabaseClient> | null = null;

  const client = () => {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return Promise.reject(
        new Error('Accounts are not connected yet: this site is missing its Supabase settings.'),
      );
    }
    pending ??= import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(SUPABASE_URL, SUPABASE_KEY, {
        // Sessions are kept in this browser so a member stays signed in.
        // Sign-in is by typed code, so the page never has to read a link.
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
      }),
    );
    return pending;
  };

  const loadMember = async (): Promise<Member | null> => {
    const sb = await client();
    const { data: session } = await sb.auth.getSession();
    if (!session.session) return null;
    const { data, error } = await sb
      .from('members')
      .select(MEMBER_COLUMNS)
      .eq('id', session.session.user.id)
      .maybeSingle();
    if (error) throw explain(error);
    return data ? fromRow(data as MemberRow) : null;
  };

  return {
    requiresEmail: true,
    canChangeEmail: false,

    current: loadMember,

    async register(input) {
      const data = tidy(input);
      if (!data.email) {
        throw new Error('An email address is needed so we can send you a sign-in code.');
      }
      const sb = await client();
      const { error } = await sb.auth.signInWithOtp({
        email: data.email,
        options: {
          shouldCreateUser: true,
          // The database trigger copies these onto the new member row.
          data: { name: data.name, phone: data.phone ?? '' },
        },
      });
      if (error) throw explain(error);
      return { kind: 'code-sent', email: data.email };
    },

    async signIn(email) {
      const sb = await client();
      const { error } = await sb.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: false },
      });
      // An address with no account is treated the same as one with an
      // account, so this form cannot be used to discover who is a member.
      if (error && !/signups not allowed|not found/i.test(error.message)) throw explain(error);
      return { kind: 'code-sent', email: email.trim() };
    },

    async verify(email, code) {
      const sb = await client();
      const { error } = await sb.auth.verifyOtp({
        email: email.trim(),
        token: code.replace(/\s/g, ''),
        type: 'email',
      });
      if (error) throw explain(error);
      const member = await loadMember();
      if (!member) throw new Error('You are signed in, but your details could not be found.');
      return member;
    },

    async update(id, input) {
      const data = tidy(input);
      const sb = await client();
      const { data: row, error } = await sb
        .from('members')
        .update({ name: data.name, phone: data.phone ?? null })
        .eq('id', id)
        .select(MEMBER_COLUMNS)
        .single();
      if (error) {
        if (error.code === '23505') {
          throw new Error('Another account already uses that phone number.');
        }
        throw explain(error);
      }
      return fromRow(row as MemberRow);
    },

    async signOut() {
      const sb = await client();
      await sb.auth.signOut({ scope: 'local' });
    },

    async remove() {
      const sb = await client();
      const { error } = await sb.rpc('delete_my_account');
      if (error) throw explain(error);
      // The sign-in no longer exists, so this only clears the stored session.
      await sb.auth.signOut({ scope: 'local' }).catch(() => {});
    },
  };
};
/** Chosen by one environment value so the switch needs no code change. */
const choose = (): AccountBackend => {
  const which = (import.meta.env.VITE_ACCOUNTS_BACKEND as string | undefined) ?? 'local';
  return which === 'supabase' ? createSupabaseBackend() : createLocalBackend();
};

export const accounts: AccountBackend = choose();
