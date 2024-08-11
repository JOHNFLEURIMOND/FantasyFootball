import styled, { keyframes } from 'styled-components'; // Import keyframes along with styled
import { fleurimondColors } from '../CSS/theme'; // Import the color theme

// Keyframes for Loader
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled Components
export const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const Loader = styled.div`
  border: 8px solid ${fleurimondColors.grey};
  border-top: 8px solid ${fleurimondColors.blue};
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 1s linear infinite;
`;

export const StyledSelect = styled.select`
  width: 100%;
  max-width: 420px;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${fleurimondColors.black};
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s;

  &:focus {
    border-color: ${fleurimondColors.blue};
    outline: none;
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

export const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  align-items: center;
`;

export const LoadingDiv = styled.div`
  display: grid;
  justify-items: center;
  align-items: center;
  gap: 1rem;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));

  @media (max-width: 464px) {
    grid-template-columns: 1fr;
  }
`;

export const SearchDiv = styled.div`
  margin-bottom: 1.5rem;
  width: 100%;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

export const SelectDiv = styled.div`
  margin-bottom: 1.5rem;
  width: 100%;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

export const Card = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
`;

export const CardHeader = styled.div`
  background-color: #f4f4f4;
  padding: 1rem;
  font-weight: bold;
`;

export const CardBody = styled.div`
  padding: 1rem;
`;

export const NameFieldset = styled.div`
  margin-bottom: 0.5rem;
`;

export const Description = styled.div`
  margin-bottom: 0.5rem;
`;

export const HeaderTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0;
`;

// Add MainContainer and Title if they are used in WeeklyProjections.jsx
export const MainContainer = styled.div`
  padding: 2rem;
  background-color: ${fleurimondColors.white};
`;

export const Title = styled.h1`
  font-size: 2rem;
  color: ${fleurimondColors.primary};
  margin-bottom: 1.5rem;
`;
