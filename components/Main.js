import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import GlobalStyle from './CSS/global-style';
import './index.css';
import Loading from './Loading';
import { Helmet } from 'react-helmet';

// Lazy load the App component
const App = lazy(() => import('./App'));

// SEO component for managing document head
const SEO = () => (
  <Helmet>
    <title>Homepage - Fantasy Football</title>
    <meta
      name='description'
      content='Get the latest news and updates on Fantasy Football. Stay ahead with expert rankings, projections, and more.'
    />
    <meta
      name='keywords'
      content='fantasy football, football, fantasy, ESPN, sports, PPR, stats'
    />
  </Helmet>
);

// Main component rendering App with SEO and global styles
const Main = () => (
  <>
    <SEO />
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
