// components/CSS/global-style.jsx
import { createGlobalStyle } from 'styled-components';
import theme from '../CSS/theme'; // Correct import for theme

const GlobalStyle = createGlobalStyle`
  :root {
    --font-heading: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    --font-body: Georgia, "Times New Roman", Times, serif;
    --font-size-base: 62.5%;
    --font-size-heading: 3rem;
    --font-size-body: 1.6rem;
    --line-height-heading: 4rem;
    --line-height-body: 2.6rem;
    --font-weight-heading: 700;
    --font-weight-body: 400;
    --color-background: ${theme.fleurimondColors.white};
    --color-primary-text: ${theme.fleurimondColors.smoke};
    --color-accent: ${theme.fleurimondColors.tartBlue}; // Updated to tartBlue
    --color-border: ${theme.fleurimondColors.graySmoke}; // Adjusted to graySmoke
    --color-button-primary-bg: ${theme.fleurimondColors.buttons.blue}; // Updated to theme button color
    --color-button-primary-text: ${theme.fleurimondColors.white}; // Updated to white
    --color-shadow: ${theme.fleurimondColors.black}; // Example shadow color
    --scrollbar-width: 1.5rem;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    font-size: var(--font-size-base);
    overflow-x: hidden;
  }

  body {
    background-color: var(--color-background);
    color: var(--color-primary-text);
    font-family: var(--font-body);
    font-weight: var(--font-weight-body);
    line-height: var(--line-height-body);
    font-size: var(--font-size-body);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    font-weight: var(--font-weight-heading);
    color: var(--color-primary-text);
    line-height: var(--line-height-heading);
    font-size: var(--font-size-heading);
  }

  /* Responsive Styles */
  @media (max-width: ${theme.media.mobile}) {
    body {
      font-size: 1.4rem;
    }
    .container {
      padding: 10px;
    }
    .header {
      font-size: 1.8rem;
    }
    .button {
      padding: 10px 20px;
      font-size: 1.4rem;
    }
    .footer {
      padding: 1rem;
    }
  }

  @media (max-width: ${theme.media.tab}) {
    body {
      font-size: 1.6rem;
    }
    .container {
      padding: 15px;
    }
    .header {
      font-size: 2rem;
    }
    .button {
      padding: 12px 24px;
      font-size: 1.6rem;
    }
    .footer {
      padding: 1.5rem;
    }
  }

  @media (min-width: ${theme.media.tab}) and (max-width: 979px) {
    body {
      font-size: 1.8rem;
    }
    .container {
      padding: 20px;
    }
    .header {
      font-size: 2.4rem;
    }
    .button {
      padding: 15px 30px;
      font-size: 1.8rem;
    }
    .footer {
      padding: 2rem;
    }
  }

  @media (min-width: ${theme.media.desktop}) {
    body {
      font-size: 2rem;
    }
    .container {
      padding: 30px;
    }
    .header {
      font-size: 2.8rem;
    }
    .button {
      padding: 20px 40px;
      font-size: 2rem;
    }
    .footer {
      padding: 3rem;
    }
  }
`;

export default GlobalStyle;
