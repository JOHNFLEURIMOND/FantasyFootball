import React from 'react';
import styled from 'styled-components';
import { NavLink } from '../routing/SimpleRouter';
import { fleurimondColors } from '../CSS/theme';

const Footer = () => (
  <FooterWrapper>
    <div>
      <h2>Fantasy Football</h2>
      <p>Public NFL player research, schedules, and fantasy statistics.</p>
      <p>Data can lag roster changes and completed games. Projections are estimates.</p>
      <nav aria-label='Footer navigation'>
        <NavLink to='/players'>Players</NavLink>
        <NavLink to='/teams'>Teams</NavLink>
        <NavLink to='/schedule'>Schedule</NavLink>
        <a href='https://github.com/JOHNFLEURIMOND/FantasyFootball'>Project on GitHub</a>
      </nav>
      <small>© {new Date().getFullYear()} John Fleurimond</small>
    </div>
  </FooterWrapper>
);

const FooterWrapper = styled.footer`
  border-top: 1px solid ${fleurimondColors.surfaceBorder};
  background: ${fleurimondColors.midnight};
  color: ${fleurimondColors.white};
  padding: 2.5rem 1rem;
  > div { max-width: 1200px; margin: 0 auto; }
  h2 { font-size: 1.2rem; }
  p, small { color: ${fleurimondColors.textMuted}; }
  nav { display: flex; flex-wrap: wrap; gap: 1.5rem; margin: 1.5rem 0; }
  a { color: inherit; }
  a:hover { color: ${fleurimondColors.accent}; }
  a:focus-visible { outline: 3px solid ${fleurimondColors.accent}; outline-offset: 4px; }
`;

export default Footer;
