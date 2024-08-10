import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import GlobalStyle from './CSS/global-style'; // Import the GlobalStyle
import './index.css'; // Import index.css
import Loading from './Loading'; // Import the Loading component
import { Helmet } from 'react-helmet'; // Import Helmet for SEO

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
    <GlobalStyle /> {/* Apply global styles */}
    <Suspense fallback={<Loading percentage={100} />}>
      <App />
    </Suspense>
  </>
);

// Use ReactDOM.createRoot for concurrent rendering support
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main />);
