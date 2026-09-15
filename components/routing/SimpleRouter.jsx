import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';

const RouterContext = createContext({
  location: { pathname: '/', search: '', hash: '', href: '/' },
  navigate: () => {},
});
const ParamsContext = createContext({});

const getBaseUrl = () =>
  typeof window === 'undefined' ? 'http://localhost/' : window.location.href;

const createLocationState = location => ({
  pathname: location.pathname,
  search: location.search,
  hash: location.hash,
  href: `${location.pathname}${location.search}${location.hash}` || '/',
});

const resolveToLocation = (to, baseUrl = getBaseUrl()) => {
  const resolved = new URL(to, baseUrl);
  const baseOrigin = new URL(baseUrl).origin;
  const external =
    resolved.origin !== baseOrigin ||
    !['http:', 'https:'].includes(resolved.protocol);

  return {
    pathname: resolved.pathname,
    search: resolved.search,
    hash: resolved.hash,
    href: external
      ? resolved.href
      : `${resolved.pathname}${resolved.search}${resolved.hash}` || '/',
    external,
  };
};

const isModifiedClick = event =>
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey ||
  event.button !== 0;

const formatPath = ({ pathname, search, hash }) =>
  `${pathname}${search}${hash}` || '/';

export function matchPath(pattern, pathname) {
  if (pattern === pathname) return { matched: true, params: {} };
  if (pattern === '*' || pattern === '/*') return { matched: true, params: {} };

  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return { matched: false, params: {} };

  const params = {};
  for (let index = 0; index < patternParts.length; index += 1) {
    const expected = patternParts[index];
    const actual = pathParts[index];
    if (expected.startsWith(':')) {
      params[expected.slice(1)] = decodeURIComponent(actual);
    } else if (expected !== actual) {
      return { matched: false, params: {} };
    }
  }
  return { matched: true, params };
}

export const Router = ({ children }) => {
  const [location, setLocation] = useState(() =>
    typeof window === 'undefined'
      ? { pathname: '/', search: '', hash: '', href: '/' }
      : createLocationState(window.location)
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onPopState = () => setLocation(createLocationState(window.location));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback(
    (to, options = {}) => {
      if (typeof window === 'undefined') return;
      const nextLocation = resolveToLocation(to);
      if (nextLocation.external) {
        window.location.assign(nextLocation.href);
        return;
      }
      if (nextLocation.href === location.href) return;
      if (options.replace) window.history.replaceState({}, '', nextLocation.href);
      else window.history.pushState({}, '', nextLocation.href);
      setLocation(createLocationState(window.location));
    },
    [location.href]
  );

  const value = useMemo(() => ({ location, navigate }), [location, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

export const useLocation = () => useContext(RouterContext).location;
export const useParams = () => useContext(ParamsContext);

const routeNames = {
  '/': 'NFL dashboard',
  '/players': 'Players',
  '/teams': 'Teams',
  '/standings': 'Standings',
  '/stats': 'Statistics',
  '/WeeklyProjections': 'Weekly Projections',
  '/PPR': 'PPR Rankings',
  '/Schedule': 'Schedule',
  '/compare': 'Player comparison',
  '/leaderboards': 'Leaderboards',
};

function routeName(pathname) {
  if (routeNames[pathname]) return routeNames[pathname];
  if (matchPath('/players/:id', pathname).matched) return 'Player profile';
  return 'Page not found';
}

export const RouteAnnouncer = () => {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current === pathname) return undefined;
    previousPath.current = pathname;

    const focusMain = () => {
      const main = document.getElementById('main-content');
      if (main && typeof main.focus === 'function') main.focus({ preventScroll: true });
    };

    const frame =
      typeof window.requestAnimationFrame === 'function'
        ? window.requestAnimationFrame(focusMain)
        : window.setTimeout(focusMain, 0);

    return () => {
      if (typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(frame);
      } else {
        window.clearTimeout(frame);
      }
    };
  }, [pathname]);

  return (
    <VisuallyHidden role='status' aria-live='polite' aria-atomic='true'>
      {routeName(pathname)} page loaded
    </VisuallyHidden>
  );
};

export const Route = () => null;

const VisuallyHidden = styled.p`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const Routes = ({ children, fallback = null }) => {
  const { location } = useContext(RouterContext);
  const childRoutes = React.Children.toArray(children).filter(React.isValidElement);

  for (const child of childRoutes) {
    if (child.props.path === '*' || child.props.path === '/*') continue;
    const match = matchPath(child.props.path, location.pathname);
    if (match.matched) {
      return (
        <ParamsContext.Provider value={match.params}>
          {child.props.element}
        </ParamsContext.Provider>
      );
    }
  }

  const wildcardMatch = childRoutes.find(
    child => child.props.path === '*' || child.props.path === '/*'
  );
  return wildcardMatch ? wildcardMatch.props.element : fallback;
};

export const NavLink = ({
  to,
  className,
  onClick,
  children,
  target,
  download,
  rel,
  ...rest
}) => {
  const { location, navigate } = useContext(RouterContext);
  const resolved = resolveToLocation(to);
  const isActive = !resolved.external && location.pathname === resolved.pathname;
  const resolvedClassName =
    typeof className === 'function'
      ? className({ isActive })
      : [className, isActive ? 'active' : ''].filter(Boolean).join(' ');

  const handleClick = event => {
    if (onClick) onClick(event);
    if (
      event.defaultPrevented ||
      target === '_blank' ||
      download != null ||
      rel === 'external' ||
      isModifiedClick(event) ||
      resolved.external
    ) return;
    event.preventDefault();
    navigate(to);
  };

  return (
    <a
      {...rest}
      href={resolved.external ? resolved.href : formatPath(resolved)}
      target={target}
      download={download}
      rel={rel}
      className={resolvedClassName}
      aria-current={isActive ? 'page' : undefined}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

export { createLocationState, formatPath, isModifiedClick, resolveToLocation, routeName };
