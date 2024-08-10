import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme.js';
import Button from '../Button/Button';
import Loading from '../components/Loading';
import Modal from './Modal';

const filterStats = (stats, search, positionFilter) => {
  return stats
    .filter(
      value =>
        search === '' || value.Name.toLowerCase().includes(search.toLowerCase())
    )
    .filter(
      value => positionFilter === '' || value.Position.includes(positionFilter)
    );
};

const PlayerCards = ({ stats, loading }) => {
  const [isCardFlipped, setIsCardFlipped] = useState(-1);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const handleClick = useCallback(index => {
    setIsCardFlipped(prevIndex => (prevIndex === index ? -1 : index));
  }, []);

  const handleModalOpen = player => {
    setSelectedPlayer(player);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedPlayer(null);
  };

  const filterPositionItems = [...new Set(stats.map(item => item.Position))];

  if (loading) {
    return (
      <LoadingDiv>
        <Loading percentage={100} />
      </LoadingDiv>
    );
  }

  return (
    <>
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
      <SelectDiv>
        <Select
          onChange={e => setPositionFilter(e.target.value)}
          aria-label='Filter By Position'
        >
          <option value=''>Filter By Position</option>
          {filterPositionItems.map((item, index) => (
            <option key={index} value={item}>
              Filter {item}
            </option>
          ))}
        </Select>
      </SelectDiv>
      <CardDiv>
        {filterStats(stats, search, positionFilter).map((d, index) => (
          <div key={index}>
            <CardContainer
              onClick={() => handleClick(index)}
              aria-expanded={isCardFlipped === index}
              role='button'
            >
              <CardInner $isExpanded={isCardFlipped === index}>
                <CardFront>
                  <CardContent>
                    <h3>{d.Name}</h3>
                    <p>Team: {d.Team}</p>
                    <p>Opponent: {d.Opponent}</p>
                    <Button onClick={() => handleModalOpen(d)}>Details</Button>
                  </CardContent>
                </CardFront>
                <CardBack>
                  <ExpandedContent>
                    <p>Passing Yards: {d.PassingYards}</p>
                    <p>Passing Touchdowns: {d.PassingTouchdowns}</p>
                    <p>Rushing Attempts: {d.RushingAttempts}</p>
                    <p>Rushing Yards: {d.RushingYards}</p>
                    <p>Rushing Touchdowns: {d.RushingTouchdowns}</p>
                    <p>Receptions: {d.Receptions}</p>
                    <p>Receiving Yards: {d.ReceivingYards}</p>
                    <p>Receiving Touchdowns: {d.ReceivingTouchdowns}</p>
                  </ExpandedContent>
                </CardBack>
              </CardInner>
            </CardContainer>
          </div>
        ))}
      </CardDiv>

      {isModalOpen && selectedPlayer && (
        <Modal
          title={selectedPlayer.Title}
          content={selectedPlayer.Content}
          source={selectedPlayer.Source}
          updated={selectedPlayer.Updated}
          url={selectedPlayer.Url}
          originalSource={selectedPlayer.OriginalSourceUrl}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

// Styled components
const CardContainer = styled.div`
  width: 100%;
  max-width: 400px;
  height: 300px;
  perspective: 1000px;
  cursor: pointer;
  border: 1px solid ${fleurimondColors.graySmoke};
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.3s ease-in-out;

  &:hover,
  &:focus {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    transform: scale(1.05);
  }
`;

const CardInner = styled.div`
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  position: relative;
  transform: ${({ $isExpanded }) =>
    $isExpanded ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;

const CardFront = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background-color: ${fleurimondColors.white};
`;

const CardBack = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: ${fleurimondColors.white};
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  h3 {
    margin: 1rem 0;
    font-weight: 400;
    font-size: 1.8rem;
    color: ${fleurimondColors.deepBlue};
    text-align: center;
  }

  p {
    margin: 0.5rem 0;
    text-align: center;
    font-size: 1.4rem;
    color: ${fleurimondColors.darkBrown};
  }
`;

const ExpandedContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${fleurimondColors.darkBrown};

  p {
    margin: 0.5rem 0;
    text-align: center;
    font-size: 1.2rem;
  }
`;

const LoadingDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const SearchDiv = styled.div`
  margin-bottom: 1rem;
`;

const Header = styled.h2`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid ${fleurimondColors.gray};
  border-radius: 4px;
  width: 100%;
`;

const SelectDiv = styled.div`
  margin-bottom: 1rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid ${fleurimondColors.gray};
  border-radius: 4px;
  width: 100%;
`;

const CardDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

export default PlayerCards;
