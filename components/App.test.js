// App.test.jsx

import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { ThemeProvider } from 'styled-components';
import theme from './CSS/theme'; // Adjust path as necessary

test('renders learn react link', async () => {
  render(
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  );

  // Wait for the main content to be loaded
  await waitFor(() => {
    const linkElement = screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
  });
});
