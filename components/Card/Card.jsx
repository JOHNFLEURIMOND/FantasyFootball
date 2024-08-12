import React from 'react';
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme.js';

const Card = ({ data, type, onClick, onModalOpen, isFlipped }) => {
  const isNews = type === 'news';

  return (
    <CardWrapper onClick={onClick}>
      <CardInner $isFlipped={isFlipped}>
        <CardFront>
          {isNews ? (
            <>
              <h3>{data.Title}</h3>
              <p>{data.Source}</p>
              <p>Updated: {new Date(data.Updated).toLocaleDateString()}</p>
              <p>{data.TimeAgo}</p>
            </>
          ) : (
            <>
              <h3>
                {data.AwayTeam} vs {data.HomeTeam}
              </h3>
              <p>Date: {new Date(data.Date).toLocaleDateString()}</p>
              <p>Channel: {data.Channel}</p>
              <p>Point Spread: {data.PointSpread}</p>
              <p>Over/Under: {data.OverUnder}</p>
              <p>
                Stadium: {data.StadiumDetails.Name}, {data.StadiumDetails.City},{' '}
                {data.StadiumDetails.State}
              </p>
            </>
          )}
        </CardFront>
        <CardBack>
          {isNews ? (
            <>
              <p>{data.Summary}</p>
              <button onClick={() => onModalOpen(data)}>More Details</button>
            </>
          ) : (
            <>
              <p>Point Spread: {data.PointSpread}</p>
              <p>Over/Under: {data.OverUnder}</p>
              <p>Channel: {data.Channel}</p>
              <p>Stadium: {data.StadiumDetails.Name}</p>
              <button onClick={() => onModalOpen(data)}>More Details</button>
            </>
          )}
        </CardBack>
      </CardInner>
    </CardWrapper>
  );
};

// Card Styles
const CardWrapper = styled.div`
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

const CardInner = styled.div`
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  position: relative;
  transform: ${({ $isFlipped }) =>
    $isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;

const CardFront = styled.div`
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

const CardBack = styled.div`
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

export default Card;
