import React, { useState, useCallback, useEffect } from 'react';
import { NavLink } from '../routing/SimpleRouter';
import styled from 'styled-components';
import { CgMenu, CgCloseR } from 'react-icons/cg';
import { fleurimondColors } from '../CSS/theme.js'; // Ensure this path is correct

// Styled Nav component
const Nav = styled.nav.attrs(props => ({
  'data-open-menu': props.openMenu,
  'data-visible': props.visible,
}))`
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  background-color: ${fleurimondColors.midnight};
  color: ${fleurimondColors.white};
  font-family: 'Exo 2', sans-serif;
  padding: 0.75rem clamp(1rem, 4vw, 3rem);
  z-index: 9999;
  transition: transform 0.3s ease-in-out;
  transform: ${({ 'data-visible': visible }) =>
    visible ? 'translateY(0)' : 'translateY(-100%)'};

  .navbar-list {
    display: flex;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
    justify-content: center;

    li {
      margin: 0;
      padding: 0;

      .navbar-link {
        display: inline-block;
        text-decoration: none;
        font-size: 0.95rem;
        font-weight: 700;
        color: ${fleurimondColors.white};
        transition:
          color 0.3s linear,
          background-color 0.2s ease;
        padding: 0.7rem 0.9rem;
        border-radius: 999px;
        background-color: transparent;

        &:hover,
        &:focus,
        &.active {
          color: ${fleurimondColors.infrared};
          background-color: rgba(255, 255, 255, 0.2);
        }

        &:focus-visible {
          outline: 3px solid ${fleurimondColors.sassySaffron};
          outline-offset: 2px;
        }
      }
    }
  }

  .mobile-navbar-btn {
    display: none;

    .mobile-nav-icon {
      font-size: 4.2rem;
      color: ${fleurimondColors.white};
      cursor: pointer;
      background: none;
      border: none;
      border-radius: 0.5rem;

      &:focus-visible {
        outline: 3px solid ${fleurimondColors.sassySaffron};
        outline-offset: 2px;
      }
    }
  }

  @media (max-width: 800px) {
    .navbar-list {
      width: 100vw;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      background-color: ${fleurimondColors.midnight};
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      text-align: center;
      transform: ${({ 'data-open-menu': openMenu }) =>
        openMenu ? 'translateX(0)' : 'translateX(100%)'};
      visibility: ${({ 'data-open-menu': openMenu }) =>
        openMenu ? 'visible' : 'hidden'};
      opacity: ${({ 'data-open-menu': openMenu }) => (openMenu ? 1 : 0)};
      transition:
        transform 0.3s ease,
        visibility 0.3s ease,
        opacity 0.3s ease;
      z-index: 9999;
    }

    .navbar-list li {
      margin: 1rem 0;

      .navbar-link {
        font-size: 1.5rem;
        color: ${fleurimondColors.white};
        padding: 1rem 2rem;
        background-color: transparent;
        border-radius: 0.5rem;

        &:hover,
        &:focus,
        &.active {
          color: ${fleurimondColors.infrared};
          background-color: rgba(255, 255, 255, 0.2);
        }
      }
    }

    .mobile-navbar-btn {
      display: inline-block;
      z-index: 1000;
    }
  }

  @media (min-width: 801px) {
    .mobile-navbar-btn {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    .navbar-list,
    .navbar-link {
      transition: none;
    }
  }
`;

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Navbar component
const Navbar = React.memo(() => {
  const [openMenu, setOpenMenu] = useState(false);
  const [visible, setVisible] = useState(true);

  const handleMenuToggle = useCallback(() => {
    setOpenMenu(prevState => !prevState);
  }, []);

  useEffect(() => {
    let lastScrollTop = 0;

    const handleScroll = debounce(() => {
      const scrollTop = window.scrollY;

      if (scrollTop > lastScrollTop) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollTop = scrollTop;
    }, 100); // Debounce delay

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!openMenu) {
      return undefined;
    }

    const closeOnEscape = event => {
      if (event.key === 'Escape') {
        setOpenMenu(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [openMenu]);

  return (
    <Nav aria-label='Primary' openMenu={openMenu} visible={visible}>
      <button
        type='button'
        className='mobile-navbar-btn'
        onClick={handleMenuToggle}
        aria-label={openMenu ? 'Close menu' : 'Open menu'}
        aria-controls='primary-navigation'
        aria-expanded={openMenu}
      >
        {openMenu ? (
          <CgCloseR className='mobile-nav-icon' />
        ) : (
          <CgMenu className='mobile-nav-icon' />
        )}
      </button>
      <ul className='navbar-list' id='primary-navigation'>
        <li>
          <NavLink
            className='navbar-link'
            onClick={() => setOpenMenu(false)}
            to='/'
            aria-label='Navigate to Command Center'
          >
            Command Center
          </NavLink>
        </li>
        <li>
          <NavLink
            className='navbar-link'
            onClick={() => setOpenMenu(false)}
            to='/WeeklyProjections'
            aria-label='Navigate to Weekly Projections'
          >
            Weekly Projections
          </NavLink>
        </li>
        <li>
          <NavLink
            className='navbar-link'
            onClick={() => setOpenMenu(false)}
            to='/PPR'
            aria-label='Navigate to PPR'
          >
            PPR
          </NavLink>
        </li>
        <li>
          <NavLink
            className='navbar-link'
            onClick={() => setOpenMenu(false)}
            to='/Schedule'
            aria-label='Navigate to Schedule'
          >
            Schedule
          </NavLink>
        </li>
        {/* Uncomment if needed
          <li>
            <NavLink
              className='navbar-link'
              onClick={() => setOpenMenu(false)}
              to='/Replays'
              aria-label='Navigate to Replays'
            >
              Replays
            </NavLink>
          </li> */}
      </ul>
    </Nav>
  );
});

export default Navbar;
