import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { fleurimondColors } from '../CSS/theme.js';

const ScheduleCardWithModal = ({ data }) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleCardClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <CardWrapper onClick={handleCardClick}>
        <CardHeader>
          {data.AwayTeam} vs {data.HomeTeam}
        </CardHeader>
        <CardDetails>
          <DetailItem>
            Date: {new Date(data.Date).toLocaleDateString()}
          </DetailItem>
          <DetailItem>
            Time: {new Date(data.DateTime).toLocaleTimeString()}
          </DetailItem>
          <DetailItem>Channel: {data.Channel}</DetailItem>
          <DetailItem>Point Spread: {data.PointSpread}</DetailItem>
          <DetailItem>Over/Under: {data.OverUnder}</DetailItem>
          <DetailItem>Stadium: {data.StadiumDetails.Name}</DetailItem>
        </CardDetails>
      </CardWrapper>

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={handleCloseModal}>×</CloseButton>
            <ModalTitle>
              {data.AwayTeam} vs {data.HomeTeam}
            </ModalTitle>
            <ModalDetails>
              <DetailItem>
                <Label>Date:</Label> {new Date(data.Date).toLocaleDateString()}
              </DetailItem>
              <DetailItem>
                <Label>Channel:</Label> {data.Channel}
              </DetailItem>
              <DetailItem>
                <Label>Point Spread:</Label> {data.PointSpread}
              </DetailItem>
              <DetailItem>
                <Label>Over/Under:</Label> {data.OverUnder}
              </DetailItem>
              <DetailItem>
                <Label>Money Line:</Label> {data.AwayTeamMoneyLine} (Away) /{' '}
                {data.HomeTeamMoneyLine} (Home)
              </DetailItem>
              <DetailItem>
                <Label>Stadium:</Label> {data.StadiumDetails.Name}
              </DetailItem>
              <DetailItem>
                <Label>Location:</Label> {data.StadiumDetails.City},{' '}
                {data.StadiumDetails.State || data.StadiumDetails.Country}
              </DetailItem>
              <DetailItem>
                <Label>Playing Surface:</Label>{' '}
                {data.StadiumDetails.PlayingSurface}
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

// ScheduleCard Styles
const CardWrapper = styled.div`
  background: ${fleurimondColors.white};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 600px;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto;
  gap: 1rem;
`;

const CardHeader = styled.h3`
  font-size: 1.5rem;
  color: ${fleurimondColors.deepBlue};
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
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
    Channel: PropTypes.string.isRequired,
    PointSpread: PropTypes.string.isRequired,
    OverUnder: PropTypes.string.isRequired,
    StadiumDetails: PropTypes.shape({
      Name: PropTypes.string.isRequired,
      City: PropTypes.string.isRequired,
      State: PropTypes.string,
      Country: PropTypes.string,
      PlayingSurface: PropTypes.string,
    }).isRequired,
    AwayTeamMoneyLine: PropTypes.string.isRequired,
    HomeTeamMoneyLine: PropTypes.string.isRequired,
    Status: PropTypes.string.isRequired,
  }).isRequired,
};

export default ScheduleCardWithModal;
