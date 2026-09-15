import React from 'react';
import { fleurimondColors } from '../CSS/theme';
import heroImage from '../../public/fantasyfootball.jpeg';
import styled from 'styled-components';

const SimpleHeroSection = () => {
  return (
    <HeroSection>
      <h1>Main Hero Section</h1>
    </HeroSection>
  );
};

const HeroSection = styled.div`
  background-image: url(${heroImage});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
  min-height: min(100dvh, 62rem);
  box-sizing: border-box;
  font-size: 1.25rem; /* 20px */
  background-color: ${fleurimondColors.midnight};
  margin-bottom: 0;
  z-index: 0;

  @media only screen and (max-width: 800px) {
    min-height: 56vh;
  }
  @media only screen and (max-width: 420px) {
    min-height: 48vh;
  }
`;

export default SimpleHeroSection;
