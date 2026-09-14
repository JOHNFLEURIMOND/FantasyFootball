import React from 'react';
import styled, { keyframes } from 'styled-components';

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

const LoadingContainer = styled.div`
  position: relative;
  width: 100%;
  height: 5px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: 20px 0;
`;

const ProgressBar = styled.div`
  position: absolute;
  height: 100%;
  background-color: #3b82f6;
  animation: ${loadingAnimation} 2s linear infinite;
  transform: scaleX(${({ $percentage }) => $percentage});
  transform-origin: left;
  transition: transform 0.2s ease-in-out;
`;

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

const Loading = ({ percentage = 0 }) => {
  const boundedPercentage = Math.min(Math.max(Number(percentage) || 0, 0), 100);

  return (
    <LoadingContainer role='progressbar' aria-valuemin='0' aria-valuemax='100' aria-valuenow={boundedPercentage}>
      <BackgroundIndicator aria-hidden='true' />
      <ProgressBar $percentage={boundedPercentage / 100} />
    </LoadingContainer>
  );
};

export default Loading;
