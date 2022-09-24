import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Card, CardHeader, YoutubeCardContent, CardBody, NameFieldset, PriceFieldset, AVideo} from '../Card/index';
import {Dimmer, Loader, Image, Segment} from 'semantic-ui-react';
import {CardDiv} from './index';

export default function WeeklyProjectionCards({stats, loading}) {
  const [card, flipCard] = useState(false);
  const [search, setSearch] = useState('');

  if (loading) {
    return (
      <div>
        <Segment>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>

          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
      </div>
    );
  }

  return (
    <div>
      <h1>Search Players</h1>
      <input type='text' placeholder='Search For News' onChange={(e) => setSearch(e.target.value)} />

      <>
        <CardDiv>
          {stats
            .filter((value) => {
              if (search === '') {
                return value;
              } else if (value.Name.toLowerCase().includes(search.toLowerCase())) {
                return value;
              }
            })
            .map((d, index) => (
              <div key={d.PlayerID}>
                {card ? (
                  <Card>
                    <CardBody
                      onClick={() => flipCard(false)}
                      role='contentInfo'
                      aria-pressed='false'
                      aria-label='Product Card with a Image and a list of price, type of strain, thc and cbd levels.'>
                      <CardHeader role='img' aria-label='Description of the Product image'>
                        <NameFieldset aria-label='title'>
                          Active: {d.Activated === 1 ? 'Active' : 'Not Active'}
                        </NameFieldset>
                      </CardHeader>
                      <NameFieldset aria-label='title'>Fantasy Points FanDuel: {d.FantasyPointsFanDuel}</NameFieldset>
                      <NameFieldset aria-label='description'>Fantasy Points: {d.FantasyPoints}</NameFieldset>
                      <NameFieldset aria-label='description'>FantasyPointsPPR: {d.FantasyPointsPPR}</NameFieldset>
                    </CardBody>
                  </Card>
                ) : (
                  <Card>
                    <CardBody onClick={() => flipCard(true)}>
                      <CardHeader role='img' aria-label='Description of the overall image'>
                        <YoutubeCardContent aria-label='title'>
                          {d.Name} : {d.Position}
                        </YoutubeCardContent>
                      </CardHeader>
                      <AVideo aria-label='description'>
                        Players Team: {d.Team} VS: {d.Opponent}{' '}
                      </AVideo>
                      <AVideo aria-label='description'>
                        {d.HomeOrAway === 'AWAY' ? 'Playing Away' : 'Playing At Home'}
                      </AVideo>
                      <AVideo aria-label='description'>Game Date: {d.GameDate}</AVideo>
                    </CardBody>
                  </Card>
                )}
              </div>
            ))}
        </CardDiv>
      </>
    </div>
  );
}
