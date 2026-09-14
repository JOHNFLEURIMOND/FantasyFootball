import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { fleurimondColors } from '../CSS/theme.js';

function formatScore(score) {
  return Number.isFinite(score) ? score : '—';
}

const ScheduleCardWithModal = ({ data }) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleCardClick = () => {
    setModalOpen(true);
  };

  const handleCardKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <CardWrapper
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        role='button'
        tabIndex={0}
        aria-label={`${data.AwayTeam} at ${data.HomeTeam}, ${data.Status}`}
      >
        <CardHeader>
          {data.AwayTeam} at {data.HomeTeam}
        </CardHeader>
        <ScoreLine aria-label='Game score'>
          {data.AwayTeam} {formatScore(data.AwayScore)} – {formatScore(data.HomeScore)}{' '}
          {data.HomeTeam}
        </ScoreLine>
        <CardDetails>
          <DetailItem>
            Date: {new Date(data.Date).toLocaleDateString()}
          </DetailItem>
          <DetailItem>
            Time: {new Date(data.DateTime).toLocaleTimeString()}
          </DetailItem>
          <DetailItem>Status: {data.Status}</DetailItem>
          <DetailItem>Week: {data.Week}</DetailItem>
        </CardDetails>
      </CardWrapper>

      {isModalOpen && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent
            role='dialog'
            aria-modal='true'
            aria-labelledby={`game-${data.GameKey}`}
            onClick={event => event.stopPropagation()}
          >
            <CloseButton onClick={handleCloseModal} aria-label='Close game details'>
              ×
            </CloseButton>
            <ModalTitle id={`game-${data.GameKey}`}>
              {data.AwayTeam} at {data.HomeTeam}
            </ModalTitle>
            <ModalDetails>
              <DetailItem>
                <Label>Score:</Label> {data.AwayTeam} {formatScore(data.AwayScore)} –{' '}
                {formatScore(data.HomeScore)} {data.HomeTeam}
              </DetailItem>
              <DetailItem>
                <Label>Date:</Label> {new Date(data.Date).toLocaleDateString()}
              </DetailItem>
              <DetailItem>
                <Label>Time:</Label> {new Date(data.DateTime).toLocaleTimeString()}
              </DetailItem>
              <DetailItem>
                <Label>Season:</Label> {data.Season}
              </DetailItem>
              <DetailItem>
                <Label>Week:</Label> {data.Week}
              </DetailItem>
              <DetailItem>
                <Label>Status:</Label> {data.Status}
              </DetailItem>
            </ModalDetails>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

const CardWrapper = styled.div`
  background: ${fleurimondColors.white};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;

  &:focus-visible {
    outline: 3px solid ${fleurimondColors.blueSapphire};
    outline-offset: 3px;
  }
`;

const CardHeader = styled.h3`
  font-size: 1.25rem;
  color: ${fleurimondColors.deepBlue};
  margin: 0;
`;

const ScoreLine = styled.p`
  margin: 0;
  font-weight: 700;
`;

const CardDetails = styled.div`
  font-size: 1rem;
  color: ${fleurimondColors.gray};
`;

const DetailItem = styled.div`
  margin-bottom: 0.5rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 10000;
`;

const ModalContent = styled.div`
  background: ${fleurimondColors.white};
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: ${fleurimondColors.deepBlue};
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${fleurimondColors.blueSapphire};
    outline-offset: 2px;
  }
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const ModalDetails = styled.div`
  font-size: 1rem;
  color: ${fleurimondColors.gray};
`;

const Label = styled.span`
  font-weight: bold;
  margin-right: 0.5rem;
`;

ScheduleCardWithModal.propTypes = {
  data: PropTypes.shape({
    GameKey: PropTypes.string.isRequired,
    AwayTeam: PropTypes.string.isRequired,
    HomeTeam: PropTypes.string.isRequired,
    Date: PropTypes.string.isRequired,
    DateTime: PropTypes.string.isRequired,
    Status: PropTypes.string.isRequired,
    Week: PropTypes.number.isRequired,
    Season: PropTypes.string.isRequired,
    AwayScore: PropTypes.number,
    HomeScore: PropTypes.number,
  }).isRequired,
};

export default ScheduleCardWithModal;
