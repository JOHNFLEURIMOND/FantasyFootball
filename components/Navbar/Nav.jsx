import React, { useState, useCallback, useEffect, useRef } from 'react';
import { NavLink } from '../routing/SimpleRouter';
import styled from 'styled-components';
import { CgMenu, CgCloseR } from 'react-icons/cg';
import { fleurimondColors } from '../CSS/theme.js';

const navItems = [
  ['Home', '/'],
  ['Players', '/players'],
  ['Teams', '/teams'],
  ['Schedule', '/Schedule'],
  ['Standings', '/standings'],
  ['Stats', '/stats'],
  ['Projections', '/WeeklyProjections'],
  ['PPR', '/PPR'],
  ['Compare', '/compare'],
  ['Leaderboards', '/leaderboards'],
];

const Nav = styled.nav`
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  background-color: rgba(10, 11, 26, 0.96);
  border-bottom: 1px solid ${fleurimondColors.surfaceBorder};
  backdrop-filter: blur(12px);
  color: ${fleurimondColors.white};
  font-family: 'Exo 2', sans-serif;
  padding: 0.75rem clamp(1rem, 4vw, 3rem);
  z-index: 9999;
  transition: transform 0.3s ease-in-out;
  transform: ${({ $visible }) => $visible ? 'translateY(0)' : 'translateY(-100%)'};

  .navbar-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    list-style: none;
    margin: 0;
    padding: 0;
    justify-content: center;
  }

  .navbar-link {
    display: inline-block;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 700;
    color: ${fleurimondColors.white};
    padding: 0.6rem 0.75rem;
    border-radius: 999px;
    border: 1px solid transparent;
    transition: background-color 160ms ease, border-color 160ms ease;

    &:hover {
      background-color: ${fleurimondColors.surface};
      border-color: ${fleurimondColors.surfaceBorder};
    }

    &.active {
      color: ${fleurimondColors.backgroundDeep};
      background-color: ${fleurimondColors.accent};
      border-color: ${fleurimondColors.accent};
    }

    &:focus-visible {
      outline: 3px solid ${fleurimondColors.accent};
      outline-offset: 2px;
    }
  }

  .mobile-navbar-btn {
    display: none;
    background: none;
    border: none;
    color: ${fleurimondColors.white};

    &:focus-visible {
      outline: 3px solid ${fleurimondColors.accent};
      outline-offset: 2px;
    }
  }

  .mobile-nav-icon {
    font-size: 2.5rem;
  }

  @media (max-width: 900px) {
    .navbar-list {
      width: 100vw;
      height: 100vh;
      position: fixed;
      inset: 0;
      background-color: ${fleurimondColors.midnight};
      justify-content: center;
      align-items: center;
      align-content: center;
      flex-direction: column;
      transform: ${({ $openMenu }) => $openMenu ? 'translateX(0)' : 'translateX(100%)'};
      visibility: ${({ $openMenu }) => $openMenu ? 'visible' : 'hidden'};
      opacity: ${({ $openMenu }) => $openMenu ? 1 : 0};
      z-index: 9999;
    }

    .navbar-link {
      font-size: 1.2rem;
      padding: 0.65rem 1rem;
    }

    .mobile-navbar-btn {
      display: inline-block;
      position: relative;
      z-index: 10000;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    .navbar-list, .navbar-link { transition: none; }
  }
`;

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const Navbar = React.memo(() => {
  const [openMenu, setOpenMenu] = useState(false);
  const [visible, setVisible] = useState(true);
  const toggleRef = useRef(null);
  const firstLinkRef = useRef(null);
  const handleMenuToggle = useCallback(() => setOpenMenu(value => !value), []);

  useEffect(() => {
    let lastScrollTop = 0;
    const handleScroll = debounce(() => {
      const scrollTop = window.scrollY;
      setVisible(scrollTop <= lastScrollTop);
      lastScrollTop = scrollTop;
    }, 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!openMenu) return undefined;
    firstLinkRef.current?.focus();
    const closeOnEscape = event => {
      if (event.key === 'Escape') {
        setOpenMenu(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [openMenu]);

  return (
    <Nav aria-label='Primary navigation' $openMenu={openMenu} $visible={visible}>
      <button
        ref={toggleRef}
        type='button'
        className='mobile-navbar-btn'
        onClick={handleMenuToggle}
        aria-label={openMenu ? 'Close menu' : 'Open menu'}
        aria-controls='primary-navigation'
        aria-expanded={openMenu}
      >
        {openMenu ? <CgCloseR className='mobile-nav-icon' aria-hidden='true' /> : <CgMenu className='mobile-nav-icon' aria-hidden='true' />}
      </button>
      <ul className='navbar-list' id='primary-navigation'>
        {navItems.map(([label, to], index) => (
          <li key={to}>
            <NavLink
              ref={index === 0 ? firstLinkRef : undefined}
              className='navbar-link'
              onClick={() => setOpenMenu(false)}
              to={to}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </Nav>
  );
});

export default Navbar;
