import React, { useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  HeaderTitle,
  CardBody,
  NameFieldset,
  Description,
} from '../Card/index';
import { Dimmer, Loader, Image, Segment, Input } from 'semantic-ui-react';
import { CardDiv, LoadingDiv, SearchDiv, Header } from './index';

export default function WeeklyProjectionCards({ stats, loading }) {
  const [isCardFlipped, setIsCardFlipped] = useState(-1);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const handleClick = useCallback(index => {
    setIsCardFlipped(index);
    if (isCardFlipped == index) {
      setIsCardFlipped(-1);
    }
  });

  const filterPositionItems = [...new Set(stats.map(item => item.Position))];

  if (loading) {
    return (
      <LoadingDiv>
        <Segment size='massive' style={{ height: '650px' }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        <Segment size='massive' style={{ height: '650px' }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        <Segment size='massive' style={{ height: '650px' }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        <Segment size='massive' style={{ height: '650px' }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        <Segment size='massive' style={{ height: '650px' }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        <Segment size='massive' style={{ height: '650px' }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>{' '}
        <Segment size='massive' style={{ height: '650px' }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        <Segment size='massive' style={{ height: '650px' }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
      </LoadingDiv>
    );
  }
  let statsSort = null;
  if (positionFilter === 'QB') {
    statsSort = (
      <select>
        <option value=''>Sort By Stat</option>
        <option key='1' value='PassingYards'>
          Passing Yards
        </option>
        <option key='2' value='PassingTouchdowns'>
          Passing Touchdowns
        </option>
        <option key='3' value='PassingAttempts'>
          {' '}
          Passing Attempts
        </option>
      </select>
    );
  }
  return (
    <div>
      <div className='SearchBar'>
        <SearchDiv>
          <Header>Search Players</Header>
          <Input
            type='text'
            label='NFL'
            loading={loading}
            placeholder='Search For Players'
            onChange={e => setSearch(e.target.value)}
          />
        </SearchDiv>

        <SearchDiv className='select'>
          <select
            onChange={e => setPositionFilter(e.target.value)}
            className='custom-select'
            aria-label='Filter Countries By Position'
          >
            <option value=''>Filter By Position</option>
            {filterPositionItems.map((item, index) => (
              <option key={index} value={item}>
                Filter {item}
              </option>
            ))}
          </select>
          {statsSort}
        </SearchDiv>
      </div>
      <>
        <CardDiv>
          {stats
            .filter(value => {
              if (search === '') {
                return value;
              } else if (
                value.Name.toLowerCase().includes(search.toLowerCase())
              ) {
                return value;
              }
            })
            .filter(value => {
              if (positionFilter === '') {
                return value;
              } else if (value.Position.includes(positionFilter)) {
                return value;
              }
            })
            .map((d, index) => (
              <div key={index}>
                {isCardFlipped === index ? (
                  <Card>
                    <CardBody
                      onClick={() => handleClick(index)}
                      role='contentInfo'
                      aria-pressed='false'
                      aria-label='Product Card with a Image and a list of price, type of strain, thc and cbd levels.'
                    >
                      <CardHeader
                        role='img'
                        aria-label='Description of the Product image'
                      >
                        <NameFieldset aria-label='title'>
                          Active: {d.Activated === 1 ? 'Active' : 'Not Active'}
                        </NameFieldset>
                      </CardHeader>
                      <NameFieldset aria-label='title'>
                        Fantasy Points FanDuel: {d.FantasyPointsFanDuel}
                      </NameFieldset>
                      <NameFieldset aria-label='description'>
                        Fantasy Points: {d.FantasyPoints}
                      </NameFieldset>
                      <NameFieldset aria-label='description'>
                        FantasyPointsPPR: {d.FantasyPointsPPR}
                      </NameFieldset>
                    </CardBody>
                  </Card>
                ) : (
                  <Card>
                    <CardBody onClick={() => handleClick(index)}>
                      <CardHeader
                        role='img'
                        aria-label='Description of the overall image'
                      >
                        <HeaderTitle aria-label='title'>
                          {d.Name} : {d.Position}
                        </HeaderTitle>
                      </CardHeader>
                      <Description aria-label='description'>
                        Players Team: {d.Team} VS: {d.Opponent}{' '}
                      </Description>
                      <Description aria-label='description'>
                        {d.HomeOrAway === 'AWAY'
                          ? 'Playing Away'
                          : 'Playing At Home'}
                      </Description>
                      <Description aria-label='description'>
                        Game Date: {d.GameDate}
                      </Description>
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
