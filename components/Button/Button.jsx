// src/styles/Button.jsx
import React from 'react';
import styled, { css } from 'styled-components';
import { space } from 'styled-system';
import { fleurimondColors } from '../CSS/theme.js'; // Ensure this path is correct

const baseButtonStyles = css`
  border-radius: 3px;
  border-style: solid;
  border-width: 1px;
  cursor: pointer;
  display: inline-block;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  letter-spacing: 0.02em;
  line-height: 1;
  padding: 8px 16px; // Default padding

  &:hover,
  &:active,
  &:focus {
    text-decoration: none;
  }

  &:disabled {
    opacity: 1;
    pointer-events: none;
  }
`;

const buttonVariants = {
  primary: {
    color: fleurimondColors.primaryButtonColor || '#fff',
    backgroundColor: fleurimondColors.primaryButtonBgColor || '#007bff',
    borderColor: fleurimondColors.primaryButtonBorderColor || '#007bff',

    '&:hover,&:active,&:focus': {
      backgroundColor: fleurimondColors.primaryButtonHoverBgColor || '#0056b3',
      borderColor: fleurimondColors.primaryButtonHoverBorderColor || '#004085',
      color: fleurimondColors.primaryButtonHoverColor || '#fff',
    },

    '&:disabled': {
      backgroundColor:
        fleurimondColors.primaryButtonDisabledBgColor || '#e0e0e0',
      borderColor:
        fleurimondColors.primaryButtonDisabledBorderColor || '#e0e0e0',
      color: fleurimondColors.primaryButtonDisabledColor || '#6c757d',
    },
  },
  secondary: {
    color: fleurimondColors.secondaryButtonColor || '#fff',
    backgroundColor: fleurimondColors.secondaryButtonBgColor || '#6c757d',
    borderColor: fleurimondColors.secondaryButtonBorderColor || '#6c757d',

    '&:hover,&:active,&:focus': {
      backgroundColor:
        fleurimondColors.secondaryButtonHoverBgColor || '#5a6268',
      borderColor:
        fleurimondColors.secondaryButtonHoverBorderColor || '#545b62',
      color: fleurimondColors.secondaryButtonHoverColor || '#fff',
    },

    '&:disabled': {
      backgroundColor:
        fleurimondColors.secondaryButtonDisabledBgColor || '#e0e0e0',
      borderColor:
        fleurimondColors.secondaryButtonDisabledBorderColor || '#e0e0e0',
      color: fleurimondColors.secondaryButtonDisabledColor || '#6c757d',
    },
  },
};

const buttonSizes = {
  small: {
    fontSize: '12px',
    padding: '6px 9px',
  },
  medium: {
    fontSize: '13px',
    padding: '8px 11px',
  },
  large: {
    fontSize: '18px',
    padding: '12px 14px',
    fontWeight: 700,
  },
};

const getButtonStyles = ({ variant = 'secondary', size = 'small' }) => css`
  ${baseButtonStyles};
  ${buttonSizes[size]};
  ${buttonVariants[variant]};
  ${space};
`;

const StyledButton = styled.button`
  ${props => getButtonStyles(props)};
`;

const StyledLink = styled.a`
  ${props => getButtonStyles(props)};
`;

const Button = ({ variant = 'secondary', size = 'small', href, ...rest }) => {
  if (href) {
    return (
      <StyledLink href={href} {...rest}>
        {rest.children}
      </StyledLink>
    );
  }

  return (
    <StyledButton variant={variant} size={size} {...rest}>
      {rest.children}
    </StyledButton>
  );
};

export default Button;
