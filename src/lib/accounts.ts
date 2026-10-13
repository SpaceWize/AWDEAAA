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

export interface AccountBackend {
  /** Who is signed in on this device, if anyone. */
  current(): Promise<Member | null>;
  /** Create a member. Rejects if the email or phone is already registered. */
  register(input: MemberInput): Promise<Member>;
  /** Sign in by email. The browser store has no password; see the note above. */
  signIn(email: string): Promise<Member>;
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

export const validate = (input: MemberInput): FieldErrors => {
  const errors: FieldErrors = {};
  const name = input.name.trim();
  const email = input.email?.trim() ?? '';
  const phone = normalisePhone(input.phone ?? '');

  if (!name) errors.name = 'Please enter your name or a username.';
  else if (name.length > 80) errors.name = 'Please keep this under 80 characters.';

  if (email && !EMAIL.test(email)) errors.email = 'That email address does not look right.';

  if (phone && (phone.length < 10 || phone.length > 15)) {
    errors.phone = 'Please enter a phone number with area code, for example 604 555 0100.';
  }

  if (!email && !phone && !errors.name) {
    errors.contact = 'Please give an email address, a phone number, or both.';
  }
  return errors;
};

export const hasErrors = (errors: FieldErrors) => Object.keys(errors).length > 0;

// ---------------------------------------------------------------------------
// Browser-only backend.
// ---------------------------------------------------------------------------

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

  const tidy = (input: MemberInput): MemberInput => ({
    name: input.name.trim(),
    email: input.email?.trim() || undefined,
    phone: normalisePhone(input.phone ?? '') || undefined,
  });

  return {
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
      return member;
    },

    async signIn(email) {
      const member = readMembers().find((m) => sameEmail(m.email, email));
      if (!member) {
        throw new Error('No account was found with that email address on this device.');
      }
      window.localStorage.setItem(SESSION_KEY, member.id);
      return member;
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
// The Supabase backend is deliberately not written yet. To connect it: implement
// the seven methods of AccountBackend in createSupabaseBackend below, using the
// same validate() and normalisePhone() helpers, then set
// VITE_ACCOUNTS_BACKEND=supabase. Pages do not change.
// ---------------------------------------------------------------------------

const createSupabaseBackend = (): AccountBackend => {
  throw new Error('Supabase accounts are not connected yet.');
};

/** Chosen by one environment value so the switch needs no code change. */
const choose = (): AccountBackend => {
  const which = (import.meta.env.VITE_ACCOUNTS_BACKEND as string | undefined) ?? 'local';
  return which === 'supabase' ? createSupabaseBackend() : createLocalBackend();
};

export const accounts: AccountBackend = choose();
