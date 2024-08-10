import React, { useState, useCallback, memo } from 'react';
import {
  Card,
  CardHeader,
  HeaderTitle,
  CardBody,
  NameFieldset,
  Description,
} from '../Card/index';
import Loading from '../../components/Loading';
import { CardDiv, LoadingDiv, SearchDiv, Select, SelectDiv } from './index';

const WeeklyProjectionCards = memo(({ stats, loading }) => {
  const [isCardFlipped, setIsCardFlipped] = useState(-1);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');

  const handleClick = useCallback(index => {
    setIsCardFlipped(prevIndex => (prevIndex === index ? -1 : index));
  }, []);

  const filterPositionItems = [...new Set(stats.map(item => item.Position))];

  if (loading) {
    return (
      <LoadingDiv>
        <Loading percentage={100} /> {/* Use Loading component */}
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
            placeholder='Search For Players'
            onChange={e => setSearch(e.target.value)}
          />
        </SearchDiv>
        <SelectDiv className='select'>
          <Select
            onChange={e => setPositionFilter(e.target.value)}
            aria-label='Filter Players By Position'
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
          .filter(
            value =>
              search === '' ||
              value.Name.toLowerCase().includes(search.toLowerCase())
          )
          .filter(
            value =>
              positionFilter === '' || value.Position.includes(positionFilter)
          )
          .map((d, index) => (
            <div key={index}>
              {isCardFlipped === index ? (
                <Card>
                  <CardBody
                    onClick={() => handleClick(index)}
                    role='contentInfo'
                    aria-pressed={isCardFlipped === index}
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
                      Fantasy Points PPR: {d.FantasyPointsPPR}
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
                      Players Team: {d.Team} VS: {d.Opponent}
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
});

export default WeeklyProjectionCards;
