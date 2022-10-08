import React, { useState } from 'react';
import moment from 'moment';
import {
  Footer,
  FooterLogo,
  Menu,
  MenuItem,
  MenuLink,
  MenuIcon,
} from './index';

const JFFooter = () => {
  //click is the initial state and setclick will be the update state
  const [click, setClick] = useState(false);

  //Create a function to handle the click state of the menu icon.
  //if the menu icon was the menu bar at the beginning when clicked it will have the close icon
  const handleClick = () => setClick(!click);

  return (
    <Footer>
      <Menu onClick={handleClick} click={click}>
        <FooterLogo to='/'>
          <MenuIcon />
          Fantasy Football '22
        </FooterLogo>
        <MenuItem>
          <MenuLink onClick={handleClick} to='/'>
            {moment().format('llll')}
          </MenuLink>
        </MenuItem>
      </Menu>
    </Footer>
  );
};

export default JFFooter;
