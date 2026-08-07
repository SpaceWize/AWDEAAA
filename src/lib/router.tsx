import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

/** '/' in dev, '/AWDEAAA/' on GitHub Pages. Always has a trailing slash. */
const BASE = import.meta.env.BASE_URL;

/** Browser pathname -> app route ('/AWDEAAA/bios' -> '/bios'). */
const toRoute = (pathname: string) => {
  const trimmed = pathname.startsWith(BASE)
    ? pathname.slice(BASE.length)
    : pathname.replace(/^\//, '');
  return `/${trimmed.replace(/\/$/, '')}`.replace(/^\/\//, '/');
};

/** App route -> browser href ('/bios' -> '/AWDEAAA/bios'). */
export const toHref = (route: string) =>
  `${BASE}${route.replace(/^\//, '')}`;

interface RouterValue {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterValue>({
  path: '/',
  navigate: () => {},
});

export const RouterProvider = ({ children }: { children: ReactNode }) => {
  const [path, setPath] = useState(() => toRoute(window.location.pathname));

  useEffect(() => {
    const onPop = () => setPath(toRoute(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: string) => {
    if (to !== toRoute(window.location.pathname)) {
      window.history.pushState({}, '', toHref(to));
      setPath(to);
    }
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => useContext(RouterContext);

type LinkProps = { to: string; children: ReactNode } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
>;

/** Internal link that pushes history instead of doing a full page load. */
export const Link = ({ to, children, onClick, ...rest }: LinkProps) => {
  const { navigate } = useRouter();

  return (
    <a
      href={toHref(to)}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        event.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
};
