import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme.js';

// Container for the entire page
export const PPRPageContainer = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  font-size: 1rem;
  text-align: center;
  font-weight: 500;
  margin: 0;
  line-height: 1.5; // Improved line height for readability
  background-color: ${fleurimondColors.white};
`;

// Container for select elements
export const StyledSelect = styled.select`
  width: 100%;
  max-width: 420px;
  padding: 0.75rem;
  border-radius: 0.5rem; // Slightly larger radius for a softer look
  border: 1px solid ${fleurimondColors.black};
  outline: none;
  box-sizing: border-box;
  font-size: 1rem;
  transition: border-color 0.3s ease; // Smooth transition effect

  &:focus {
    border-color: ${fleurimondColors.blueSapphire};
    box-shadow: 0 0 0 2px ${fleurimondColors.blueSapphire}; // Focus state with box shadow
  }

  @media (max-width: ${({ theme }) => theme.media.tab}) {
    padding: 1rem;
    max-width: 90%; // Adjust for better spacing on tablets
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    padding: 1rem;
    max-width: 95%; // Adjust for better spacing on mobile
  }
`;

// Container for search input and filters
export const SearchDiv = styled.div`
  width: 100%;
  box-sizing: border-box;
  font-size: 1rem;
  text-align: center;
  font-weight: 500;
  padding: 1.5rem; // Increased padding for a more spacious look
  background-color: ${fleurimondColors.white};
`;

// Filter container
export const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 1.5rem; // Consistent padding
  background-color: ${fleurimondColors.white};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); // Slightly larger shadow for better depth

  @media (max-width: 800px) {
    padding: 1rem; // Adjust padding for tablets
  }

  @media (max-width: 480px) {
    padding: 0.75rem; // Adjust padding for mobile
  }
`;

// Title styling
export const Title = styled.h1`
  font-size: 2.5rem; // Slightly smaller font size for better balance
  text-align: center;
  margin: 2rem 0; // Adjust margin for consistency

  @media (max-width: 800px) {
    font-size: 2rem; // Adjust font size for tablets
    margin: 1.5rem 0; // Adjust margin for tablets
  }

  @media (max-width: 320px) {
    font-size: 1.75rem; // Adjust font size for very small screens
    margin: 1rem 0; // Adjust margin for small screens
  }
`;
