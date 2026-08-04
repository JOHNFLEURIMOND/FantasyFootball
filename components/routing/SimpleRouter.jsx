import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const RouterContext = createContext({
  location: {
    pathname: '/',
    search: '',
    hash: '',
    href: '/',
  },
  navigate: () => {},
});

const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost/';
  }

  return window.location.href;
};

const createLocationState = location => ({
  pathname: location.pathname,
  search: location.search,
  hash: location.hash,
  href: `${location.pathname}${location.search}${location.hash}` || '/',
});

const resolveToLocation = (to, baseUrl = getBaseUrl()) => {
  const resolved = new URL(to, baseUrl);
  const baseOrigin = new URL(baseUrl).origin;
  const external = resolved.origin !== baseOrigin || !['http:', 'https:'].includes(resolved.protocol);

  return {
    pathname: resolved.pathname,
    search: resolved.search,
    hash: resolved.hash,
    href: external ? resolved.href : `${resolved.pathname}${resolved.search}${resolved.hash}` || '/',
    external,
  };
};

const isModifiedClick = event =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

const formatPath = ({ pathname, search, hash }) => `${pathname}${search}${hash}` || '/';

export const Router = ({ children }) => {
  const [location, setLocation] = useState(() =>
    typeof window === 'undefined' ? { pathname: '/', search: '', hash: '', href: '/' } : createLocationState(window.location)
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const onPopState = () => {
      setLocation(createLocationState(window.location));
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const navigate = useCallback(
    (to, options = {}) => {
      if (typeof window === 'undefined') {
        return;
      }

      const nextLocation = resolveToLocation(to);

      if (nextLocation.external) {
        window.location.assign(nextLocation.href);
        return;
      }

      if (nextLocation.href === location.href) {
        return;
      }

      if (options.replace) {
        window.history.replaceState({}, '', nextLocation.href);
      } else {
        window.history.pushState({}, '', nextLocation.href);
      }

      setLocation(createLocationState(window.location));
    },
    [location.href]
  );

  const value = useMemo(
    () => ({ location, navigate }),
    [location, navigate]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

export const useLocation = () => useContext(RouterContext).location;

export const Route = () => null;

export const Routes = ({ children, fallback = null }) => {
  const { location } = useContext(RouterContext);
  const childRoutes = React.Children.toArray(children).filter(React.isValidElement);

  const exactMatch = childRoutes.find(child => child.props.path === location.pathname);
  if (exactMatch) {
    return exactMatch.props.element;
  }

  const wildcardMatch = childRoutes.find(child => child.props.path === '*' || child.props.path === '/*');
  if (wildcardMatch) {
    return wildcardMatch.props.element;
  }

  return fallback;
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
    if (onClick) {
      onClick(event);
    }

    if (
      event.defaultPrevented ||
      target === '_blank' ||
      download != null ||
      rel === 'external' ||
      isModifiedClick(event) ||
      resolved.external
    ) {
      return;
    }

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

export {
  createLocationState,
  formatPath,
  isModifiedClick,
  resolveToLocation,
};
