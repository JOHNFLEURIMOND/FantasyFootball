import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import GlobalStyle from './CSS/global-style';
import './index.css';
import Loading from './Loading';
const App = lazy(() => import('./App'));

// Render the application with shared global styles
const Main = () => (
  <>
    <GlobalStyle />
    <Suspense fallback={<Loading percentage={100} />}>
      <App />
    </Suspense>
  </>
);

// Use ReactDOM.createRoot for concurrent rendering support
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<Main />);
