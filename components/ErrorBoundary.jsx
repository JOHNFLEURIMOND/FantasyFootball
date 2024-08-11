import React, { useState, useEffect } from 'react';

// ErrorBoundary Component using functional approach
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  // This hook catches errors in the component tree
  useEffect(() => {
    const handleError = event => {
      setHasError(true);
      console.error('Error caught by Error Boundary:', event.error);
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Fallback UI
  if (hasError) {
    return (
      <div role='alert'>
        <h1>Something went wrong.</h1>
      </div>
    );
  }

  return children;
};

export default React.memo(ErrorBoundary);
