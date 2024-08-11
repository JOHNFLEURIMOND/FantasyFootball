import React, { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { CgMenu, CgCloseR } from 'react-icons/cg';
import { fleurimondColors } from '../CSS/theme.js'; // Ensure this path is correct

// Define Nav component with transient props
const Nav = styled.nav`
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  background-color: ${fleurimondColors.midnight}; // Background color set to midnight
  color: ${fleurimondColors.white}; // Text color
  font-family: 'Exo 2', sans-serif;
  padding: 1em;
  z-index: 9999;

  .navbar-list {
    display: flex;
    gap: 2.8rem;
    list-style: none;

    li {
      .navbar-link {
        display: inline-block;
        text-decoration: none;
        font-size: 1.8rem;
        text-transform: uppercase;
        color: ${fleurimondColors.white}; // Default text color
        transition:
          color 0.3s linear,
          transform 0.3s ease;

        &:hover,
        &:focus,
        &.active {
          color: ${fleurimondColors.infrared}; // Color on hover, focus, or active
          animation: shake 0.5s ease; // Shake animation
        }
      }
    }
  }

  .mobile-navbar-btn {
    display: none;

    .mobile-nav-icon {
      font-size: 4.2rem;
      color: ${fleurimondColors.white}; // Icon color
      cursor: pointer;
      background: none;
      border: none;
      outline: none;
    }
  }

  @media (max-width: 800px) {
    .navbar-list {
      width: 100vw;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      background-color: ${fleurimondColors.midnight}; // Mobile menu background color
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      text-align: center;
      transform: ${({ openMenu }) =>
        openMenu ? 'translateX(0)' : 'translateX(100%)'};
      visibility: ${({ openMenu }) => (openMenu ? 'visible' : 'hidden')};
      opacity: ${({ openMenu }) => (openMenu ? 1 : 0)};
      transition:
        transform 0.3s ease,
        visibility 0.3s ease,
        opacity 0.3s ease;
      z-index: 9999;
    }

    .navbar-list li {
      margin: 1rem 0;

      .navbar-link {
        font-size: 3rem;
        color: ${fleurimondColors.white}; // Default text color
        padding: 0.5rem 1rem;
        background-color: transparent;
        border-radius: 0.5rem;

        &:hover,
        &:focus,
        &.active {
          color: ${fleurimondColors.infrared}; // Color on hover, focus, or active
          background-color: rgba(
            255,
            255,
            255,
            0.2
          ); // Optional background color on hover
        }
      }
    }

    .mobile-navbar-btn {
      display: inline-block;
      z-index: 1000;
    }
  }

  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    50% {
      transform: translateX(5px);
    }
    75% {
      transform: translateX(-5px);
    }
    100% {
      transform: translateX(0);
    }
  }
`;

const Navbar = React.memo(() => {
  const [openMenu, setOpenMenu] = useState(false);

  const handleMenuToggle = useCallback(() => {
    setOpenMenu(prevState => !prevState);
  }, []);

  return (
    <Nav aria-label='Main Navigation' openMenu={openMenu}>
      <button
        className='mobile-navbar-btn'
        onClick={handleMenuToggle}
        aria-label={openMenu ? 'Close menu' : 'Open menu'}
      >
        {openMenu ? (
          <CgCloseR className='mobile-nav-icon' />
        ) : (
          <CgMenu className='mobile-nav-icon' />
        )}
      </button>
      <ul className='navbar-list' role='navigation' aria-expanded={openMenu}>
        <li>
          <NavLink
            className='navbar-link'
            onClick={() => setOpenMenu(false)}
            to='/'
            aria-label='Navigate to Home'
          >
            Home
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
        {/* <li>
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
