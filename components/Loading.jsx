import React from 'react';
import styled, { keyframes } from 'styled-components';

// Keyframes for the loading animation
const loadingAnimation = keyframes`
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
`;

const backgroundAnimation = keyframes`
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
`;

// Container for the loading component
const LoadingContainer = styled.div`
  position: relative;
  width: 100%;
  height: 5px; /* Adjust based on desired height */
  background-color: #e0e0e0; /* Light background for the progress bar */
  border-radius: 4px;
  overflow: hidden;
  margin: 20px 0;
`;

// Progress bar with animation
const ProgressBar = styled.div`
  position: absolute;
  height: 100%;
  background-color: #3b82f6; /* Progress bar color */
  animation: ${loadingAnimation} 2s linear infinite;
  transform: scaleX(${props => props.percentage});
  transform-origin: left;
  transition: transform 0.2s ease-in-out;
`;

// Background loading indicator
const BackgroundIndicator = styled.div`
  position: absolute;
  top: 0;
  left: -100%;
  height: 100%;
  width: 100%;
  background: linear-gradient(
    90deg,
    rgba(59, 130, 246, 0.3) 25%,
    rgba(255, 255, 255, 0) 50%,
    rgba(59, 130, 246, 0.3) 75%
  );
  animation: ${backgroundAnimation} 1.5s infinite linear;
`;

// Loading component
const Loading = ({ percentage = 0 }) => {
  return (
    <LoadingContainer>
      <BackgroundIndicator />
      <ProgressBar percentage={percentage / 100} />
    </LoadingContainer>
  );
};

export default Loading;
