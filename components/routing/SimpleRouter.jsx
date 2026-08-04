import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const RouterContext = createContext({
  pathname: '/',
  navigate: () => {},
});

export const Router = ({ children }) => {
  const [pathname, setPathname] = useState(() =>
    typeof window === 'undefined' ? '/' : window.location.pathname
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const onPopState = () => {
      setPathname(window.location.pathname);
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

      if (to === window.location.pathname) {
        return;
      }

      if (options.replace) {
        window.history.replaceState({}, '', to);
      } else {
        window.history.pushState({}, '', to);
      }

      setPathname(window.location.pathname);
    },
    [setPathname]
  );

  const value = useMemo(
    () => ({ pathname, navigate }),
    [pathname, navigate]
  );

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
};

export const Route = () => null;

export const Routes = ({ children }) => {
  const { pathname } = useContext(RouterContext);
  let matchedElement = null;

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child) || matchedElement) {
      return;
    }

    const { path, element } = child.props;
    if (path === pathname) {
      matchedElement = element;
    }
  });

  return matchedElement;
};

export const NavLink = ({
  to,
  className,
  onClick,
  children,
  target,
  ...rest
}) => {
  const { pathname, navigate } = useContext(RouterContext);
  const isActive = pathname === to;
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
  };

  return (
    <a
      {...rest}
      href={to}
      target={target}
      className={resolvedClassName}
      aria-current={isActive ? 'page' : undefined}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};
