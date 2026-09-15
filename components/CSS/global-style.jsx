// components/CSS/global-style.jsx
import { createGlobalStyle } from 'styled-components';
import theme from '../CSS/theme'; // Correct import for theme

const GlobalStyle = createGlobalStyle`
  :root {
    --font-heading: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    --font-body: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --font-size-base: 62.5%;
    --font-size-heading: 3rem;
    --font-size-body: 1.6rem;
    --line-height-heading: 4rem;
    --line-height-body: 2.6rem;
    --font-weight-heading: 700;
    --font-weight-body: 400;
    --color-background: ${theme.fleurimondColors.background};
    --color-background-deep: ${theme.fleurimondColors.backgroundDeep};
    --color-surface: ${theme.fleurimondColors.surface};
    --color-surface-border: ${theme.fleurimondColors.surfaceBorder};
    --color-row-alt: ${theme.fleurimondColors.rowAlt};
    --color-primary-text: ${theme.fleurimondColors.text};
    --color-muted-text: ${theme.fleurimondColors.textMuted};
    --color-accent: ${theme.fleurimondColors.accent};
    --color-accent-hover: ${theme.fleurimondColors.accentHover};
    --color-border: ${theme.fleurimondColors.surfaceBorder};
    --color-button-primary-bg: ${theme.fleurimondColors.accent};
    --color-button-primary-text: ${theme.fleurimondColors.white};
    --color-shadow: rgba(0, 0, 0, 0.35);
    --scrollbar-width: 1.5rem;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    font-size: var(--font-size-base);
    overflow-x: hidden;
    min-height: 100%;
  }

  body {
    background-color: var(--color-background);
    color: var(--color-primary-text);
    font-family: var(--font-body);
    font-weight: var(--font-weight-body);
    line-height: var(--line-height-body);
    font-size: var(--font-size-body);
    min-height: 100%;
    margin: 0;
  }

  #root { min-height: 100dvh; }

  a { color: inherit; }

  p, li, label, small, span { color: inherit; }

  input, select, textarea, button {
    font: inherit;
  }

  input, select, textarea {
    color: var(--color-primary-text);
    background: var(--color-row-alt);
    border: 1px solid var(--color-surface-border);
  }

  ::placeholder { color: var(--color-muted-text); opacity: 1; }

  :where(a, button, input, select, textarea, [tabindex]):focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 3px;
  }

  ::selection { color: var(--color-primary-text); background: var(--color-accent-hover); }

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

  @media (max-width: ${theme.media.tablet}) {
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

  @media (min-width: ${theme.media.tablet}) and (max-width: 979px) {
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
