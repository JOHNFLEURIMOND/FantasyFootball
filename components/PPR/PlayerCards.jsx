// PlayerCards.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import {
  CardContainer,
  CardWrapper,
  CardInner,
  CardFront,
  CardBack,
  CardImage,
  CardContent,
  ExpandedContent,
  HeaderTitle,
  Description,
  LoaderWrapper,
  NameFieldset,
  MainContainer,
  Title,
} from './CardStyles';
import Loading from '../Loading'; // Fixed import path

const PlayerCards = ({ stats, loading }) => {
  const [openModal, setOpenModal] = React.useState(null);
  const [expandedIndex, setExpandedIndex] = React.useState(null);

  const handleCardClick = index => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleOpenModal = player => {
    setOpenModal(player);
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  if (loading) {
    return (
      <LoaderWrapper>
        <Loading />
      </LoaderWrapper>
    );
  }

  return (
    <MainContainer>
      <Title>Player Cards</Title>
      <CardContainer>
        {stats.map((player, index) => (
          <CardWrapper
            key={player.Id || index}
            onClick={() => handleCardClick(index)}
          >
            <CardInner $isExpanded={expandedIndex === index}>
              <CardFront>
                <CardImage>
                  <img
                    src={player.imageUrl || '/path/to/placeholder-image.jpg'}
                    alt={player.Name || 'Player Image'}
                  />
                </CardImage>
                <CardContent>
                  <HeaderTitle>{player.Name || 'Unknown Player'}</HeaderTitle>
                  <Description>
                    Position: {player.Position || 'Unknown Position'}
                  </Description>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleOpenModal(player);
                    }}
                  >
                    More Details
                  </button>
                </CardContent>
              </CardFront>
              <CardBack>
                <ExpandedContent>
                  <HeaderTitle>{player.Name || 'Unknown Player'}</HeaderTitle>
                  <Description>
                    Stats: {player.Stats || 'No stats available'}
                  </Description>
                  {/* Additional details */}
                </ExpandedContent>
              </CardBack>
            </CardInner>
          </CardWrapper>
        ))}
      </CardContainer>

      {openModal && (
        <Modal
          title={openModal.Name || 'Unknown Player'}
          content={openModal.Description || 'No description available'}
          source={openModal.Source || 'No source available'}
          updated={openModal.Updated || 'Unknown'}
          originalSource={openModal.OriginalSource || 'Unknown'}
          onClose={handleCloseModal}
        />
      )}
    </MainContainer>
  );
};

PlayerCards.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      imageUrl: PropTypes.string,
      Name: PropTypes.string,
      Position: PropTypes.string,
      Stats: PropTypes.string,
      Description: PropTypes.string,
      Source: PropTypes.string,
      Updated: PropTypes.string,
      OriginalSource: PropTypes.string,
      Id: PropTypes.string,
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default PlayerCards;
