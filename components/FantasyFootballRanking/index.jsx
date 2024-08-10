// components/FantasyFootballRanking/index.jsx
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme.js';
import { Button } from 'semantic-ui-react';

export const MainContainer = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  font-size: 1rem;
  text-align: center;
  font-weight: 500;
  padding: 64px 250px;
  background-color: ${fleurimondColors.white};

  @media (max-width: 800px) {
    padding: 64px 15px;
  }

  @media (max-width: 400px) {
    padding: 32px 10px;
  }
`;

export const LoadingDiv = styled.div`
  display: grid;
  justify-items: center;
  align-items: center;
  grid-gap: 1rem;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-template-rows: repeat(auto-fill, minmax(300px, 1fr));

  @media (max-width: 800px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  @media (max-width: 464px) {
    grid-template-columns: 1fr;
  }
`;

export const Header = styled.p`
  font-size: 2rem;
  margin: 1rem;

  @media (max-width: 800px) {
    font-size: 1.5rem;
  }

  @media (max-width: 320px) {
    font-size: 1.25rem;
  }
`;

export const SearchDiv = styled.div`
  padding: 80px;
  background-color: ${fleurimondColors.white};

  @media (max-width: 800px) {
    padding: 40px;
  }

  @media (max-width: 400px) {
    padding: 20px;
  }
`;

export const CardDiv = styled.div`
  display: grid;
  justify-items: center;
  align-items: center;
  grid-gap: 1rem;
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));

  @media (max-width: 800px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  @media (max-width: 464px) {
    grid-template-columns: 1fr;
  }
`;

export const StyledButton = styled(Button)`
  font-size: 13px;
  border-radius: 3px;
  border-style: solid;
  border-width: 1px;
  padding: 10px;
  color: ${fleurimondColors.graySmoke};
  background-color: ${fleurimondColors.white};
  border-color: ${fleurimondColors.graySmoke};
  cursor: pointer;
  display: inline-block;
  letter-spacing: 0.02em;
  line-height: 1;

  &:hover,
  &:active,
  &:focus {
    background-color: ${fleurimondColors.graySmoke};
    border-color: ${fleurimondColors.graySmoke};
    color: ${fleurimondColors.white};
    text-decoration: none;
  }

  @media (max-width: 30em) {
    display: block;
    margin: 0.4em auto;
  }
`;

export const Title = styled.h1`
  font-size: 3rem;
  margin: 3rem;

  @media (max-width: 800px) {
    font-size: 2rem;
  }

  @media (max-width: 320px) {
    font-size: 1.5rem;
    margin: 1rem 0;
  }
`;
