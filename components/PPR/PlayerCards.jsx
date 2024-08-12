import React, { useState, useCallback, Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme.js';
import Loading from '../Loading';

const Modal = lazy(() => import('./Modal'));
const Button = lazy(() => import('../Button/Button.jsx'));

const MemoizedPlayerCard = React.memo(
  ({ player, index, handleCardClick, handleOpenModal, expandedIndex }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleClick = useCallback(() => {
      setIsExpanded(prev => !prev);
      handleCardClick(index);
    }, [handleCardClick, index]);

    const {
      Name,
      Position,
      Team,
      GameDate,
      Opponent,
      PassingAttempts,
      PassingCompletions,
      PassingYards,
      PassingTouchdowns,
      RushingAttempts,
      RushingYards,
      RushingTouchdowns,
      FantasyPoints,
      FantasyPointsFanDuel,
      FantasyPointsDraftKings,
      FantasyPointsYahoo,
    } = player;

    return (
      <FlipCard
        onClick={handleClick}
        aria-labelledby={`player-${player.PlayerID || index}`}
        role='button'
        tabIndex={0}
        aria-expanded={expandedIndex === index}
        aria-label={`Player card for ${Name || 'Unknown Player'}`}
      >
        <CardInner $isExpanded={isExpanded}>
          <CardFront>
            <CardData id={`player-${player.PlayerID || index}`}>
              <h3>{Name || 'Player Name'}</h3>
              <p>Position: {Position || 'Position'}</p>
              <p>Team: {Team || 'Team'}</p>
              <SectionTitle>Performance Summary</SectionTitle>
              <p>
                <strong>Opponent:</strong> {Opponent || 'Unknown'}
              </p>
              <p>
                <strong>Game Date:</strong>{' '}
                {GameDate ? new Date(GameDate).toLocaleDateString() : 'N/A'}
              </p>
              <p>
                <strong>Fantasy Points:</strong> {FantasyPoints || 'N/A'}
              </p>
              <p>
                <strong>FanDuel:</strong> {FantasyPointsFanDuel || 'N/A'}
              </p>
              <p>
                <strong>DraftKings:</strong> {FantasyPointsDraftKings || 'N/A'}
              </p>
              <p>
                <strong>Yahoo:</strong> {FantasyPointsYahoo || 'N/A'}
              </p>
              <Suspense fallback={<Loading />}>
                <Button
                  onClick={e => {
                    e.stopPropagation();
                    handleOpenModal(player);
                  }}
                >
                  More Details
                </Button>
              </Suspense>
            </CardData>
          </CardFront>
          <CardBack>
            <ExpandedCard aria-label='Expanded card with player details'>
              <SectionTitle>Game Performance</SectionTitle>
              <p>
                <strong>Passing Attempts:</strong> {PassingAttempts || 'N/A'}
              </p>
              <p>
                <strong>Passing Completions:</strong>{' '}
                {PassingCompletions || 'N/A'}
              </p>
              <p>
                <strong>Passing Yards:</strong> {PassingYards || 'N/A'}
              </p>
              <p>
                <strong>Passing Touchdowns:</strong>{' '}
                {PassingTouchdowns || 'N/A'}
              </p>
              <p>
                <strong>Rushing Attempts:</strong> {RushingAttempts || 'N/A'}
              </p>
              <p>
                <strong>Rushing Yards:</strong> {RushingYards || 'N/A'}
              </p>
              <p>
                <strong>Rushing Touchdowns:</strong>{' '}
                {RushingTouchdowns || 'N/A'}
              </p>
            </ExpandedCard>
          </CardBack>
        </CardInner>
      </FlipCard>
    );
  }
);

const PlayerCards = ({ stats, loading }) => {
  const [openModal, setOpenModal] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleCardClick = useCallback(
    index => {
      setExpandedIndex(expandedIndex === index ? null : index);
    },
    [expandedIndex]
  );

  const handleOpenModal = useCallback(player => {
    setOpenModal(player);
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpenModal(null);
  }, []);

  if (loading) {
    return (
      <LoaderWrapper>
        <Loading />
      </LoaderWrapper>
    );
  }

  return (
    <Wrapper>
      <Title>Fantasy Football Players</Title>
      <Section>
        {stats.map((player, index) => (
          <MemoizedPlayerCard
            key={player.PlayerID || index}
            player={player}
            index={index}
            handleCardClick={handleCardClick}
            handleOpenModal={handleOpenModal}
            expandedIndex={expandedIndex}
          />
        ))}
      </Section>
      {openModal && (
        <Suspense fallback={<Loading />}>
          <Modal player={openModal} onClose={handleCloseModal} />
        </Suspense>
      )}
    </Wrapper>
  );
};

PlayerCards.propTypes = {
  stats: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

const Wrapper = styled.div`
  padding: 2rem;
  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const Title = styled.h1`
  text-align: center;
  color: ${fleurimondColors.blueSapphire};
`;

const Section = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
`;

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const FlipCard = styled.div`
  width: 300px;
  height: 400px;
  perspective: 1000px;
  cursor: pointer;
  @media (max-width: 600px) {
    width: 100%;
    height: auto;
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
  width: 100%;
  height: 100%;
  position: absolute;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${fleurimondColors.white};
  border: 1px solid ${fleurimondColors.gray};
  border-radius: 0.5rem;
`;

const CardBack = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transform: rotateY(180deg);
  background-color: ${fleurimondColors.lightGray};
  border: 1px solid ${fleurimondColors.gray};
  border-radius: 0.5rem;
`;

const CardData = styled.div`
  text-align: center;
  padding: 1rem;
`;

const ExpandedCard = styled.div`
  padding: 1rem;
`;

const SectionTitle = styled.h4`
  font-size: 1rem;
  margin: 1rem 0;
  color: ${fleurimondColors.darkSlateGray};
`;

export default PlayerCards;
