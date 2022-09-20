import { BiMenu, BiX } from 'react-icons/bi';
import React, { useState } from 'react';
import { Nav, NavLogo, Menu, MenuItem, MenuLink, MenuIcon } from './index';

const Navbar = () => {
  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);

  return (
    <>
      <Nav>
        <NavLogo to='/'>Fantasy Football '22</NavLogo>
        <MenuIcon onClick={handleClick}>{click ? <BiX /> : <BiMenu />}</MenuIcon>

        <Menu>
          <MenuItem>
            <MenuLink to='/'>
              Home
            </MenuLink>
          </MenuItem>

          <MenuItem>
            <MenuLink
              to='/WeeklyProjections'
            >
              Weekly Projections
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink
              to='/PPR'
            >
              PPR
            </MenuLink>
          </MenuItem>
        </Menu>
      </Nav>
    </>
  );
};

export default Navbar;
