import React, {useState} from 'react';
import {Card, CardHeader, YoutubeCardContent, CardBody, NameFieldset, AVideo} from '../Card/index';
import {Dimmer, Loader, Image, Segment, Input} from 'semantic-ui-react';
import {CardDiv, LoadingDiv} from './index';

export default function WeeklyProjectionCards({stats, loading}) {
  const [card, flipCard] = useState(false);
  const [search, setSearch] = useState('');

  if (loading) {
    return (
      <LoadingDiv>
        <Segment size='massive' style={{ height: "650px" }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>   
        <Segment size='massive' style={{ height: "650px" }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        <Segment size='massive' style={{ height: "650px" }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        <Segment size='massive' style={{ height: "650px" }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        <Segment size='massive'style={{ height: "650px" }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        <Segment size='massive' style={{ height: "650px" }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment> <Segment size='massive' style={{ height: "650px" }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        <Segment size='massive' style={{ height: "650px" }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
      </LoadingDiv>
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
