// components/Card/Modal.jsx
import React from 'react';
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme.js';

const ModalContainer = styled.div`
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
  color: ${fleurimondColors.black};
`;

const ModalContent = styled.div`
  margin-top: 1rem;
  font-size: 1rem;
  color: ${fleurimondColors.black};
`;

const ModalLink = styled.a`
  color: ${fleurimondColors.blue};
  text-decoration: underline;
`;

const Modal = ({
  title,
  content,
  source,
  updated,
  url,
  originalSource,
  onClose,
}) => (
  <ModalContainer>
    <CloseButton onClick={onClose}>&times;</CloseButton>
    <ModalTitle>{title}</ModalTitle>
    <ModalContent>
      <p>{content}</p>
      <p>
        Source:{' '}
        <ModalLink href={source} target='_blank' rel='noopener noreferrer'>
          {source}
        </ModalLink>
      </p>
      <p>Updated: {updated}</p>
      <p>
        Original Source:{' '}
        <ModalLink
          href={originalSource}
          target='_blank'
          rel='noopener noreferrer'
        >
          {originalSource}
        </ModalLink>
      </p>
    </ModalContent>
  </ModalContainer>
);

export default Modal;
