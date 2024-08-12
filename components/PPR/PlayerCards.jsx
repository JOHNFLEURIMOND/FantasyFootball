import React from 'react';
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme.js';

const PlayerCard = ({ player }) => {
  if (!player) return null;

  return (
    <CardContainer>
      <PlayerImage src={player.imageURL} alt={`${player.name}'s profile`} />
      <PlayerInfo>
        <PlayerName>{player.name}</PlayerName>
        <PlayerDetails>
          <Detail>
            <strong>Position:</strong> {player.position}
          </Detail>
          <Detail>
            <strong>Points:</strong> {player.points}
          </Detail>
          <Detail>
            <strong>Team:</strong> {player.team}
          </Detail>
          {/* Add more player details here */}
        </PlayerDetails>
      </PlayerInfo>
    </CardContainer>
  );
};

const CardContainer = styled.div`
  display: flex;
  border: 1px solid ${fleurimondColors.gray};
  border-radius: 8px;
  overflow: hidden;
  background-color: ${fleurimondColors.white};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 0.5rem;
  padding: 1rem;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 800px) {
    flex-direction: column;
    align-items: center;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const PlayerImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-right: 1rem;

  @media (max-width: 800px) {
    margin-right: 0;
    margin-bottom: 1rem;
  }
`;

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const PlayerName = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: ${fleurimondColors.blueSapphire};
`;

const PlayerDetails = styled.div`
  font-size: 1rem;
  color: ${fleurimondColors.darkGray};
`;

const Detail = styled.div`
  margin-bottom: 0.5rem;
`;

export default PlayerCard;
