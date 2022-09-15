import React, { useState, useEffect } from 'react';
import Nav from '../components/Navbar/Nav.jsx';
import Footer from '../components/Footer/Footer';
import MainHero from '../components/MainHero/MainHero';
import ExperiencePage from '../components/Experience/ExperiencePage.jsx';
import { Provider as StyletronProvider, DebugEngine } from 'styletron-react';
import { Client as Styletron } from 'styletron-engine-atomic';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

const debug = process.env.NODE_ENV === 'production' ? void 0 : new DebugEngine();
const engine = new Styletron();

import { GlobalStyle, Container } from '../components/CSS/global-style';

const Homepage = (props) => {
  return (
        <Container>
          <GlobalStyle />
          <Nav />
          <MainHero />
          <ExperiencePage />
          <Footer />
        </Container>
  );
};

const App = () => (
    <StyletronProvider value={engine} debug={debug} debugAfterHydration>
      <Router location={history.location} navigator={history}>
        <Switch>
          <Route path='/' exact component={Homepage} />
        </Switch>
      </Router>
    </StyletronProvider>
);

export default App;
