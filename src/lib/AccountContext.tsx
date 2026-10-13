import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { accounts, type Member } from './accounts';

interface AccountValue {
  member: Member | null;
  /** True until the first check of this device's session has finished. */
  loading: boolean;
  /** Re-read the session, e.g. after signing in or out on this device. */
  refresh: () => Promise<void>;
}

const AccountContext = createContext<AccountValue>({
  member: null,
  loading: true,
  refresh: async () => {},
});

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setMember(await accounts.current());
    } catch {
      // A broken store should read as "not signed in", never as a crash.
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <AccountContext.Provider value={{ member, loading, refresh }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => useContext(AccountContext);
