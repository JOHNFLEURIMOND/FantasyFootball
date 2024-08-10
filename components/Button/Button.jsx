//src/styles/Button.jsx
import React from 'react';
import styled, { css } from 'styled-components';
import { space } from 'styled-system';
import theme from '../CSS/theme'; // Adjust path if needed

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
    color: theme.colors.button.primary.color,
    backgroundColor: theme.colors.button.primary.backgroundColor,
    borderColor: theme.colors.button.primary.borderColor,

    '&:hover,&:active,&:focus': {
      backgroundColor: theme.colors.button.primary.hover.backgroundColor,
      borderColor: theme.colors.button.primary.hover.borderColor,
      color: theme.colors.button.primary.hover.color,
    },

    '&:disabled': {
      backgroundColor: theme.colors.button.primary.disabled.backgroundColor,
      borderColor: theme.colors.button.primary.disabled.borderColor,
      color: theme.colors.button.primary.disabled.color,
    },
  },
  secondary: {
    color: theme.colors.button.secondary.color,
    backgroundColor: theme.colors.button.secondary.backgroundColor,
    borderColor: theme.colors.button.secondary.borderColor,

    '&:hover,&:active,&:focus': {
      backgroundColor: theme.colors.button.secondary.hover.backgroundColor,
      borderColor: theme.colors.button.secondary.hover.borderColor,
      color: theme.colors.button.secondary.hover.color,
    },

    '&:disabled': {
      backgroundColor: theme.colors.button.secondary.disabled.backgroundColor,
      borderColor: theme.colors.button.secondary.disabled.borderColor,
      color: theme.colors.button.secondary.disabled.color,
    },
  },
  // Add other button variants here...
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

const getButtonStyles = ({ variant, size }) => css`
  ${baseButtonStyles};
  ${buttonSizes[size || 'small']};
  ${buttonVariants[variant || 'secondary']};
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
    // Render as an anchor tag if href is provided
    return (
      <StyledLink href={href} {...rest}>
        {rest.children}
      </StyledLink>
    );
  }

  // Default to button tag
  return (
    <StyledButton variant={variant} size={size} {...rest}>
      {rest.children}
    </StyledButton>
  );
};

export default Button;
