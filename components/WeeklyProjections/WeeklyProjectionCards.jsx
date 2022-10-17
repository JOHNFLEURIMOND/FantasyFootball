import React, { useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  HeaderTitle,
  CardBody,
  NameFieldset,
  Description,
} from '../Card/index';
import {
  Dimmer,
  Loader,
  Image,
  Segment,
  Input,
  Form,
  Radio,
  Header,
} from 'semantic-ui-react';
import {
  CardDiv,
  LoadingDiv,
  SearchDiv,
  Select,
  option,
  SelectDiv,
} from './index';

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
        <SelectDiv className='select'>
          <Select
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
          </Select>
        </SelectDiv>
      </div>
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
                    aria-label='Player Card with a list of fantasy projection stats and match info.'
                  >
                    <CardHeader role='info' aria-label='Stats'>
                      <NameFieldset aria-label='Active or not'>
                        Active: {d.Activated === 1 ? 'Active' : 'Not Active'}
                      </NameFieldset>
                    </CardHeader>
                    <NameFieldset aria-label='Fanduel points'>
                      Fantasy Points FanDuel: {d.FantasyPointsFanDuel}
                    </NameFieldset>
                    <NameFieldset aria-label='Fantasy Football Point'>
                      Fantasy Points: {d.FantasyPoints}
                    </NameFieldset>
                    <NameFieldset aria-label='PPR Points'>
                      FantasyPointsPPR: {d.FantasyPointsPPR}
                    </NameFieldset>
                  </CardBody>
                </Card>
              ) : (
                <Card>
                  <CardBody onClick={() => handleClick(index)}>
                    <CardHeader
                      role='img'
                      aria-label='Description of the player and match'
                    >
                      <HeaderTitle aria-label='Name and Position'>
                        {d.Name} : {d.Position}
                      </HeaderTitle>
                    </CardHeader>
                    <Description aria-label='Match'>
                      Players Team: {d.Team} VS: {d.Opponent}{' '}
                    </Description>
                    <Description aria-label='Playing home or away'>
                      {d.HomeOrAway === 'AWAY'
                        ? 'Playing Away'
                        : 'Playing At Home'}
                    </Description>
                    <Description aria-label='Game Date'>
                      Game Date: {d.GameDate}
                    </Description>
                  </CardBody>
                </Card>
              )}
            </div>
          ))}
      </CardDiv>
    </div>
  );
}
