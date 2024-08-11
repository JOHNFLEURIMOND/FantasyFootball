// components/Card/Modal.jsx

import React from 'react';
import {
  ModalContainer,
  CloseButton,
  ModalTitle,
  ModalContent,
  ModalLink,
} from './index';

const Modal = ({
  title,
  content,
  source,
  updated,
  url,
  originalSource,
  onClose,
}) => {
  return (
    <ModalContainer>
      <CloseButton onClick={onClose} aria-label='Close Modal'>
        &times;
      </CloseButton>
      <ModalTitle>{title}</ModalTitle>
      <ModalContent>{content}</ModalContent>
      <ModalLink href={url} target='_blank' rel='noopener noreferrer'>
        {source}
      </ModalLink>
      <ModalLink
        href={originalSource}
        target='_blank'
        rel='noopener noreferrer'
      >
        Original Source
      </ModalLink>
      <ModalContent>Updated: {updated}</ModalContent>
    </ModalContainer>
  );
};

export default Modal;
