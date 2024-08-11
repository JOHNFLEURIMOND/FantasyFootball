// components/Card/PlayerCards.jsx

import React, { useState, useCallback } from 'react';
import {
  CardContainer,
  CardWrapper,
  CardInner,
  CardFront,
  CardBack,
  CardImage,
  CardContent,
  ExpandedContent,
  LoadingDiv,
  SearchDiv,
  Header,
  Input,
  SelectDiv,
  Select,
} from './index';
import Button from '../Button/Button';
import Loading from '../Loading';
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

const PlayerCards = ({ stats = [], loading }) => {
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
          placeholder='Search For Players'
          value={search}
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
      <CardContainer>
        {filterStats(stats, search, positionFilter).map((d, index) => (
          <CardWrapper key={index}>
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
          </CardWrapper>
        ))}
      </CardContainer>

      {isModalOpen && selectedPlayer && (
        <Modal
          title={selectedPlayer.Title || 'No Title'}
          content={selectedPlayer.Content || 'No Content'}
          source={selectedPlayer.Source || 'No Source'}
          updated={selectedPlayer.Updated || 'No Date'}
          url={selectedPlayer.Url || '#'}
          originalSource={selectedPlayer.OriginalSourceUrl || '#'}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

export default PlayerCards;
