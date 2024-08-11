import styled, { keyframes } from 'styled-components';
import { fleurimondColors } from '../CSS/theme.js';

// Keyframes for Loader (if needed)
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
  border: 8px solid ${fleurimondColors.gray};
  border-top: 8px solid ${fleurimondColors.blueSapphire};
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 1s linear infinite;
`;

export const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  align-items: center;
`;

export const CardWrapper = styled.div`
  position: relative;
  perspective: 1000px;
  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
`;

export const CardInner = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  transform: ${({ $isExpanded }) =>
    $isExpanded ? 'rotateY(180deg)' : 'rotateY(0)'};
`;

export const CardFront = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  backface-visibility: hidden;
  background-color: ${fleurimondColors.white};
`;

export const CardBack = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  backface-visibility: hidden;
  transform: rotateY(180deg);
  background-color: ${fleurimondColors.lightGray};
`;

export const CardImage = styled.div`
  width: 100%;
  height: 150px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s linear;
  }

  &:hover img {
    transform: scale(1.1);
  }
`;

export const CardContent = styled.div`
  padding: 1rem;
  color: ${fleurimondColors.black};
`;

export const ExpandedContent = styled.div`
  padding: 1rem;
  color: ${fleurimondColors.black};
`;

export const HeaderTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0;
`;

export const Description = styled.p`
  margin: 0.5rem 0;
`;

export const NameFieldset = styled.div`
  margin-bottom: 0.5rem;
`;

export const SearchDiv = styled.div`
  margin-bottom: 1.5rem;
`;

export const SelectDiv = styled.div`
  margin-bottom: 1.5rem;
`;

export const MainContainer = styled.div`
  padding: 2rem;
  background-color: ${fleurimondColors.white};
`;

export const Title = styled.h2`
  font-size: 2rem;
  color: ${fleurimondColors.blueSapphire};
  margin-bottom: 1.5rem;
`;
