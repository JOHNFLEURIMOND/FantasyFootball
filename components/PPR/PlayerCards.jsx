import React, {useState, useEffect} from 'react';
import {Provider as StyletronProvider, DebugEngine} from 'styletron-react';
import {Client as Styletron} from 'styletron-engine-atomic';
import {Card, CardHeader, YoutubeCardContent, CardBody, NameFieldset, PriceFieldset, AVideo} from '../Card/index';
import axios from 'axios';
import {ProjectsSectionContainer, Title, CardDiv} from './index';
import {GlobalStyle} from '../CSS/global-style';
import {Dimmer, Loader, Image, Segment} from 'semantic-ui-react';

const debug = process.env.NODE_ENV === 'production' ? void 0 : new DebugEngine();
const engine = new Styletron();
const key = process.env.REACT_APP_MY_API_KEY;
export default function PlayerCards({pprStats = [], loading}) {
  const [card, flipCard] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <div>
      <ProjectsSectionContainer>
        <GlobalStyle />
        <Title>Fantasy Football PPR Stats</Title>
        <div>{error.message}</div>
        <div>
          <h1>Search Players</h1>
          <input type='text' placeholder='Search For News' onChange={(e) => setSearch(e.target.value)} />
        </div>
        <CardDiv>
          {loaded ? (
            <Segment>
              <Dimmer active inverted>
                <Loader size='large'>Loading</Loader>
              </Dimmer>

              <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
            </Segment>
          ) : (
            pprStats
              .filter((value) => {
                if (search === '') {
                  return value;
                } else if (value.Name.toLowerCase().includes(search.toLowerCase())) {
                  return value;
                }
              })
              .map((d, index) => (
                <div>
                  {card ? (
                    <Card key={index}>
                      <CardBody
                        onClick={() => flipCard(false)}
                        role='contentInfo'
                        aria-pressed='false'
                        aria-label='Product Card with a Image and a list of price, type of strain, thc and cbd levels.'>
                        <CardHeader role='img' aria-label='Description of the Product image'>
                          <NameFieldset aria-label='title'>
                            Passing Yards/ Passing TDS: {d.PassingYards} : {d.PassingTouchdowns}:
                          </NameFieldset>
                        </CardHeader>
                        <NameFieldset aria-label='title' key={d.PlayerID}>
                          Rushing Attempts/ Rushing Yard/ TDS : {d.RushingAttempts} : {d.RushingYards} :{' '}
                          {d.RushingTouchdowns}
                        </NameFieldset>
                        <NameFieldset aria-label='title' key={d.PlayerID}>
                          Receptions/ Receiving Yards/ TDS: {d.Receptions} {d.ReceivingYards} : {d.ReceivingTouchdowns}
                        </NameFieldset>
                      </CardBody>
                    </Card>
                  ) : (
                    <Card key={d.PlayerID}>
                      <CardBody onClick={() => flipCard(true)}>
                        <CardHeader role='img' aria-label='Description of the overall image'>
                          <YoutubeCardContent aria-label='title'>{d.Name}</YoutubeCardContent>
                        </CardHeader>
                        <AVideo aria-label='description'>
                          Players Team: {d.Team} VS: {d.Opponent}{' '}
                        </AVideo>
                      </CardBody>
                    </Card>
                  )}
                </div>
              ))
          )}
        </CardDiv>
      </ProjectsSectionContainer>
    </div>
  );
}
