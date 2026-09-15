import React from 'react';
import { fleurimondColors } from '../CSS/theme';
import heroImage from '../../public/fantasyfootball.jpeg';
import styled from 'styled-components';

const SimpleHeroSection = () => {
  return (
    <HeroSection aria-labelledby="hero-title">
      <HeroOverlay />
      <HeroContent>
        <HeroEyebrow>Public NFL data hub</HeroEyebrow>
        <HeroTitle id="hero-title">Fantasy football, without the guesswork.</HeroTitle>
        <HeroCopy>
          Search players, compare production, review weekly projections, and follow the schedule from one reliable dashboard.
        </HeroCopy>
        <HeroActions>
          <HeroLink href="/players">Explore players</HeroLink>
          <SecondaryLink href="/projections">View projections</SecondaryLink>
        </HeroActions>
      </HeroContent>
    </HeroSection>
  );
};

const HeroSection = styled.div`
  background-image: url(${heroImage});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
  min-height: min(720px, 100dvh);
  box-sizing: border-box;
  font-size: 1.25rem; /* 20px */
  background-color: ${fleurimondColors.midnight};
  margin-bottom: 20px;
  isolation: isolate;
  display: flex;
  align-items: flex-end;
  overflow: hidden;

  @media only screen and (max-width: 800px) {
    min-height: 620px;
  }
  @media only screen and (max-width: 420px) {
    min-height: 560px;
  }
`;

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    linear-gradient(90deg, rgba(1, 0, 46, 0.96) 0%, rgba(1, 0, 46, 0.72) 34%, rgba(1, 0, 46, 0.08) 74%),
    linear-gradient(0deg, rgba(1, 0, 46, 0.72), transparent 42%);
`;

const HeroContent = styled.div`
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: clamp(6rem, 14vw, 10rem) 2rem 4rem;
  position: relative;
  z-index: 1;

  @media (max-width: 600px) {
    padding: 8rem 1.25rem 3rem;
  }
`;

const HeroEyebrow = styled.p`
  color: #ff3b56;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin-bottom: 1rem;
`;

const HeroTitle = styled.h1`
  color: #ffffff;
  font-size: clamp(2.6rem, 6vw, 5.5rem);
  font-weight: 900;
  letter-spacing: -0.055em;
  line-height: 0.98;
  max-width: 11ch;
  text-wrap: balance;
`;

const HeroCopy = styled.p`
  color: #d9dcec;
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  line-height: 1.6;
  max-width: 46ch;
  margin: 1.5rem 0 2rem;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const HeroLink = styled.a`
  background: #ff3b56;
  border: 1px solid #ff3b56;
  border-radius: 999px;
  color: #0a0b1a;
  font-weight: 800;
  padding: 0.85rem 1.25rem;
  text-decoration: none;
  transition: transform 160ms ease, background-color 160ms ease;

  &:hover { background: #e62e45; transform: translateY(-2px); }
  &:focus-visible { outline: 3px solid #ffffff; outline-offset: 3px; }
`;

const SecondaryLink = styled(HeroLink)`
  background: rgba(20, 22, 43, 0.78);
  border-color: rgba(255, 255, 255, 0.35);
  color: #ffffff;

  &:hover { background: #14162b; }
`;

export default SimpleHeroSection;
