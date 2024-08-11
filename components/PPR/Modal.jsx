import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme.js';

const Modal = ({ player, onClose }) => {
  const {
    Name,
    Position,
    Team,
    GameDate,
    PassingAttempts,
    PassingCompletions,
    PassingYards,
    PassingTouchdowns,
    RushingAttempts,
    RushingYards,
    RushingTouchdowns,
    FantasyPoints,
    FantasyPointsFanDuel,
    FantasyPointsDraftKings,
    FantasyPointsYahoo,
    InjuryStatus,
    InjuryNotes,
    FantasyDataSalary,
    PlayingSurface,
    Stadium,
    Temperature,
    Humidity,
    WindSpeed,
  } = player;

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}>X</CloseButton>
        <h2>{Name}</h2>
        <h4>
          {Position} - {Team}
        </h4>

        <SectionTitle>Game Performance</SectionTitle>
        <p>
          <strong>Game Date:</strong> {new Date(GameDate).toLocaleDateString()}
        </p>
        <p>
          <strong>Passing Attempts:</strong> {PassingAttempts}
        </p>
        <p>
          <strong>Passing Completions:</strong> {PassingCompletions}
        </p>
        <p>
          <strong>Passing Yards:</strong> {PassingYards}
        </p>
        <p>
          <strong>Passing Touchdowns:</strong> {PassingTouchdowns}
        </p>
        <p>
          <strong>Rushing Attempts:</strong> {RushingAttempts}
        </p>
        <p>
          <strong>Rushing Yards:</strong> {RushingYards}
        </p>
        <p>
          <strong>Rushing Touchdowns:</strong> {RushingTouchdowns}
        </p>

        <SectionTitle>Fantasy Points</SectionTitle>
        <p>
          <strong>Fantasy Points:</strong> {FantasyPoints}
        </p>
        <p>
          <strong>FanDuel:</strong> {FantasyPointsFanDuel}
        </p>
        <p>
          <strong>DraftKings:</strong> {FantasyPointsDraftKings}
        </p>
        <p>
          <strong>Yahoo:</strong> {FantasyPointsYahoo}
        </p>

        <SectionTitle>Additional Information</SectionTitle>
        <p>
          <strong>Injury Status:</strong> {InjuryStatus}
        </p>
        <p>
          <strong>Injury Notes:</strong> {InjuryNotes}
        </p>
        <p>
          <strong>Fantasy Salary:</strong> ${FantasyDataSalary}
        </p>
        <p>
          <strong>Playing Surface:</strong> {PlayingSurface}
        </p>
        <p>
          <strong>Stadium:</strong> {Stadium}
        </p>

        <SectionTitle>Game Conditions</SectionTitle>
        <p>
          <strong>Temperature:</strong>{' '}
          {Temperature ? `${Temperature}°F` : 'N/A'}
        </p>
        <p>
          <strong>Humidity:</strong> {Humidity ? `${Humidity}%` : 'N/A'}
        </p>
        <p>
          <strong>Wind Speed:</strong> {WindSpeed ? `${WindSpeed} mph` : 'N/A'}
        </p>
      </ModalContent>
    </ModalOverlay>
  );
};

Modal.propTypes = {
  player: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: ${fleurimondColors.white};
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: ${fleurimondColors.blueSapphire};
  color: ${fleurimondColors.white};
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
`;

const SectionTitle = styled.h4`
  margin-top: 1rem;
  font-size: 1.125rem;
  color: ${fleurimondColors.blueSapphire};
`;

export default Modal;
