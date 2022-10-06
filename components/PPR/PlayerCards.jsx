import React, {useState} from 'react';
import {Card, CardHeader, YoutubeCardContent, CardBody, NameFieldset, PriceFieldset, AVideo} from '../Card/index';
import {CardDiv} from './index';
import {Dimmer, Loader, Image, Segment} from 'semantic-ui-react';
import {Input} from 'semantic-ui-react';
const key = process.env.REACT_APP_MY_API_KEY;

export default function PlayerCards({stats, loading, error}) {
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
      <div className='SearchBar'>
        <h1>Search Players</h1>
        <Input
          type='text'
          label='NFL'
          loading={loading}
          placeholder='Search For Players'
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
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
          ))}
      </CardDiv>
    </div>
  );
}
