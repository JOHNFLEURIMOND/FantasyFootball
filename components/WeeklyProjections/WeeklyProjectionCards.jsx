import React, { useState, useCallback, memo } from 'react';
import TextInput from './TextInput'; // Import the TextInput component
import styled, { keyframes } from 'styled-components'; // Import keyframes along with styled
import { fleurimondColors } from '../CSS/theme'; // Import the color theme

const WeeklyProjectionCards = ({ stats, loading }) => {
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
        {[...Array(9)].map((_, i) => (
          <LoaderWrapper key={i}>
            <Loader />
          </LoaderWrapper>
        ))}
      </LoadingDiv>
    );
  }

  return (
    <div>
      <SearchDiv>
        <h2>Search Players</h2>
        <TextInput
          name='search'
          title='Search'
          placeholder='Search For Players'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </SearchDiv>
      <SelectDiv>
        <StyledSelect
          onChange={e => setPositionFilter(e.target.value)}
          aria-label='Filter Players By Position'
        >
          <option value=''>Filter By Position</option>
          {filterPositionItems.map((item, index) => (
            <option key={index} value={item}>
              Filter {item}
            </option>
          ))}
        </StyledSelect>
      </SelectDiv>
      <CardContainer>
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
            <Card key={index}>
              <CardBody
                onClick={() => handleClick(index)}
                role='contentInfo'
                aria-pressed={isCardFlipped === index}
                aria-label='Player Card with a list of fantasy projection stats and match info.'
              >
                {isCardFlipped === index ? (
                  <>
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
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </CardBody>
            </Card>
          ))}
      </CardContainer>
    </div>
  );
};

// Keyframes for Loader
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled Components
export const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const Loader = styled.div`
  border: 8px solid ${fleurimondColors.grey};
  border-top: 8px solid ${fleurimondColors.blue};
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 1s linear infinite;
`;

export const StyledSelect = styled.select`
  width: 100%;
  max-width: 420px;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${fleurimondColors.black};
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s;

  &:focus {
    border-color: ${fleurimondColors.blue};
    outline: none;
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

export const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  align-items: center;
`;

export const LoadingDiv = styled.div`
  display: grid;
  justify-items: center;
  align-items: center;
  gap: 1rem;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));

  @media (max-width: 464px) {
    grid-template-columns: 1fr;
  }
`;

export const SearchDiv = styled.div`
  margin-bottom: 1.5rem;
  width: 100%;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

export const SelectDiv = styled.div`
  margin-bottom: 1.5rem;
  width: 100%;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

export const Card = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
`;

export const CardHeader = styled.div`
  background-color: #f4f4f4;
  padding: 1rem;
  font-weight: bold;
`;

export const CardBody = styled.div`
  padding: 1rem;
`;

export const NameFieldset = styled.div`
  margin-bottom: 0.5rem;
`;

export const Description = styled.div`
  margin-bottom: 0.5rem;
`;

export const HeaderTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0;
`;

export default memo(WeeklyProjectionCards);
