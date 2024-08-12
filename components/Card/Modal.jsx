import React from 'react';
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme.js';
import PropTypes from 'prop-types';

const Modal = ({ data, type, onClose }) => {
  return (
    <ModalWrapper>
      <ModalContent>
        <CloseButton onClick={onClose}>×</CloseButton>
        {type === 'news' ? (
          <>
            <ModalTitle>{data.Title}</ModalTitle>
            <p>{data.Summary}</p>
            <p>Source: {data.Source}</p>
            <p>Updated: {new Date(data.Updated).toLocaleDateString()}</p>
            <p>Time Ago: {data.TimeAgo}</p>
          </>
        ) : (
          <>
            <ModalTitle>
              {data.AwayTeam} vs {data.HomeTeam}
            </ModalTitle>
            <p>Date: {new Date(data.Date).toLocaleDateString()}</p>
            <p>Channel: {data.Channel}</p>
            <p>Point Spread: {data.PointSpread}</p>
            <p>Over/Under: {data.OverUnder}</p>
            <p>Stadium: {data.StadiumDetails.Name}</p>
            <p>
              Stadium Location: {data.StadiumDetails.City},{' '}
              {data.StadiumDetails.State}
            </p>
            <p>
              Temperature Forecast: {data.ForecastTempLow} to{' '}
              {data.ForecastTempHigh}
            </p>
            <p>Weather Description: {data.ForecastDescription}</p>
          </>
        )}
      </ModalContent>
    </ModalWrapper>
  );
};

// Modal Styles
const ModalWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${fleurimondColors.white};
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: ${fleurimondColors.deepBlue};
`;

const ModalContent = styled.div`
  margin-top: 1rem;
  font-size: 1rem;
  color: ${fleurimondColors.darkBrown};
`;

Modal.propTypes = {
  data: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Modal;
