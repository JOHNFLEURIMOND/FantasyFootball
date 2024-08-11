// components/Card/index.jsx

import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme.js';

// Card Styles
export const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
`;

export const CardWrapper = styled.div`
  width: 100%;
  max-width: 300px;
  height: 400px;
  perspective: 1000px;
  cursor: pointer;
  border: 1px solid ${fleurimondColors.graySmoke};
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.3s ease-in-out;

  &:hover,
  &:focus {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    transform: scale(1.05);
  }
`;

export const CardInner = styled.div`
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  position: relative;
  transform: ${({ $isExpanded }) =>
    $isExpanded ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;

export const CardFront = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background-color: ${fleurimondColors.white};
`;

export const CardBack = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background-color: ${fleurimondColors.white};
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
`;

export const CardImage = styled.div`
  width: 100%;
  height: 60%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  img {
    width: 100%;
    height: auto;
  }
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  h3 {
    margin: 0.5rem 0;
    font-weight: 400;
    font-size: 1.6rem;
    color: ${fleurimondColors.deepBlue};
    text-align: center;
  }

  p {
    margin: 0.3rem 0;
    text-align: center;
    font-size: 1.2rem;
    color: ${fleurimondColors.darkBrown};
  }
`;

export const ExpandedContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${fleurimondColors.darkBrown};

  p {
    margin: 0.3rem 0;
    text-align: center;
    font-size: 1rem;
  }
`;

export const LoadingDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

export const SearchDiv = styled.div`
  margin-bottom: 1rem;
`;

export const Header = styled.h2`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

export const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid ${fleurimondColors.gray};
  border-radius: 4px;
  width: 100%;
`;

export const SelectDiv = styled.div`
  margin-bottom: 1rem;
`;

export const Select = styled.select`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid ${fleurimondColors.gray};
  border-radius: 4px;
  width: 100%;
`;

// Modal Styles
export const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${fleurimondColors.white};
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

export const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: ${fleurimondColors.deepBlue};
`;

export const ModalContent = styled.div`
  margin-top: 1rem;
  font-size: 1rem;
  color: ${fleurimondColors.darkBrown};
`;

export const ModalLink = styled.a`
  display: block;
  margin-top: 1rem;
  color: ${fleurimondColors.primary};
  text-decoration: underline;
`;
