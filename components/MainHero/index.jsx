// components/HeroSection/index.jsx
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme';
import heroImage from '../../public/fantasyfootball.jpeg';

// Styled component for the main hero section
export const HeroSection = styled.div`
  background-image: url(${heroImage});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
  font-size: 1.25rem; /* 20px */
  background-color: ${fleurimondColors.midnight};
  margin-bottom: 20px;
  z-index: -1;

  @media only screen and (max-width: 800px) {
    min-height: 50vh;
  }
  @media only screen and (max-width: 420px) {
    min-height: 50vh;
  }
`;

// Styled component for the left section
export const LeftSection = styled.div`
  min-width: 100vw;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// Styled component for the main title
export const MainTitle = styled.h1`
  letter-spacing: 1px;
  font-size: 2.4em;
  padding: 1rem;
  margin-top: 2em;

  @media only screen and (max-width: 800px) {
    font-size: 1.8em;
  }
  @media only screen and (max-width: 420px) {
    font-size: 1em;
  }
`;

// Styled component for the name title
export const NameTitle = styled.h1`
  letter-spacing: 1px;
  font-size: 3.4em;
  padding: 1rem;

  @media only screen and (max-width: 800px) {
    font-size: 1.8em;
  }
  @media only screen and (max-width: 420px) {
    font-size: 1em;
  }
`;

// Styled component for the profession title
export const ProfessionTitle = styled.h1`
  letter-spacing: 1px;
  font-size: 2em;
  padding: 1rem;

  @media only screen and (max-width: 800px) {
    font-size: 1.8em;
  }
  @media only screen and (max-width: 420px) {
    font-size: 1em;
  }
`;

// Styled component for the span title
export const SpanTitle = styled.h1`
  letter-spacing: 1px;
  display: inline-block;
  font-size: 2em;
  padding: 1rem;
  color: ${fleurimondColors.palesasAqua};

  @media only screen and (max-width: 800px) {
    font-size: 1.8em;
  }
  @media only screen and (max-width: 420px) {
    font-size: 1em;
  }
`;
