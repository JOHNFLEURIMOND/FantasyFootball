// components/PPR/index.jsx
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme.js';
import { Button } from 'semantic-ui-react';

// Container for the entire page
export const PPRPageContainer = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  font-size: 1rem;
  text-align: center;
  font-weight: 500;
  margin: 0;
  line-height: normal;
  background-color: ${fleurimondColors.white};
  padding: 64px 10%;

  @media (max-width: 1200px) {
    padding: 64px 5%;
  }

  @media (max-width: 800px) {
    padding: 64px 2%;
  }
`;

// Container for select elements
export const StyledSelect = styled.select`
  width: 100%;
  max-width: 420px;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${({ theme }) => theme.fleurimondColors.black};
  outline: none;
  box-sizing: border-box;
  font-size: 1rem;
  transition: border-color 0.3s;

  &:focus {
    border-color: ${({ theme }) => theme.fleurimondColors.blue};
  }

  @media (max-width: ${({ theme }) => theme.media.tab}) {
    padding: 1rem;
    max-width: 86%;
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    padding: 1rem;
    max-width: 85%;
  }
`;

// Container for search input and filters
export const SearchDiv = styled.div`
  width: 100%;
  box-sizing: border-box;
  font-size: 1rem;
  text-align: center;
  font-weight: 500;
  padding: 20px;
  background-color: ${fleurimondColors.white};
`;

// Adding FilterContainer styled component
export const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 20px;
  background-color: ${fleurimondColors.white};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 800px) {
    padding: 15px;
  }

  @media (max-width: 480px) {
    padding: 10px;
  }
`;

// Section for player cards
export const CardSection = styled.div`
  display: grid;
  justify-items: center;
  align-items: center;
  grid-gap: 1rem;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));

  @media (max-width: 800px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  @media (max-width: 430px) {
    grid-template-columns: 1fr;
  }
`;

// Div for player cards
export const CardDiv = styled.div`
  display: grid;
  justify-items: center;
  align-items: center;
  grid-gap: 1rem;
  width: 100%;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  padding: 0 5em;

  @media (max-width: 800px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    padding: 0 2em;
  }

  @media (max-width: 464px) {
    grid-template-columns: 1fr;
  }
`;

// Title for the page
export const Title = styled.h1`
  font-size: 3rem;
  text-align: center;
  margin: 3rem;

  @media (max-width: 800px) {
    font-size: 2rem;
    margin: 2rem;
  }

  @media (max-width: 320px) {
    font-size: 1.5rem;
    margin: 1rem;
  }
`;

// Container for loading state
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
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-template-rows: repeat(auto-fill, minmax(200px, 1fr));
  }

  @media (max-width: 464px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr 1fr;
  }
`;
