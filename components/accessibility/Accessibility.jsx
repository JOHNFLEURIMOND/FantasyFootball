import React from 'react';
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme';

const SkipAnchor = styled.a`
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 20000;
  transform: translateY(-200%);
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  background: ${fleurimondColors.white};
  color: ${fleurimondColors.midnight};
  font-weight: 700;
  text-decoration: none;

  &:focus-visible {
    transform: translateY(0);
    outline: 3px solid ${fleurimondColors.sassySaffron};
    outline-offset: 2px;
  }
`;

const ScrollRegion = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 0.25rem;

  &:focus-visible {
    outline: 3px solid ${fleurimondColors.blueSapphire};
    outline-offset: 2px;
  }
`;

export const SkipLink = () => (
  <SkipAnchor href='#main-content'>Skip to main content</SkipAnchor>
);

export const TableRegion = ({ label, children }) => (
  <ScrollRegion role='region' aria-label={label} tabIndex='0'>
    {children}
  </ScrollRegion>
);
