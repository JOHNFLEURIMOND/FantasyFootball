import React, { useContext, useState, useCallback, useEffect } from 'react';
import { NewsContext } from '../context';
import Card from '../Card/Card';
import Modal from '../Card/Modal';
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme.js';

const FantasyFootballRanking = () => {
  const [isCardFlipped, setIsCardFlipped] = useState(-1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [dataType, setDataType] = useState('');
  const { news, loaded, fetchNews } = useContext(NewsContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchNews();
      } catch (error) {
        console.error('Error fetching news data:', error);
      }
    };

    fetchData();
  }, [fetchNews]);

  const handleCardClick = useCallback((index, type) => {
    setIsCardFlipped(prevIndex => (prevIndex === index ? -1 : index));
    setDataType(type);
  }, []);

  const handleModalOpen = useCallback((data, type) => {
    setSelectedData(data);
    setDataType(type);
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedData(null);
  }, []);

  if (!loaded) {
    return <LoadingDiv>Loading...</LoadingDiv>;
  }

  return (
    <>
      <CardContainer>
        {news.length > 0 ? (
          news.map((d, index) => (
            <Card
              key={d.ID}
              data={d}
              type='news'
              onClick={() => handleCardClick(index, 'news')}
              onModalOpen={() => handleModalOpen(d, 'news')}
              isFlipped={isCardFlipped === index}
            />
          ))
        ) : (
          <NoDataMessage>No news available.</NoDataMessage>
        )}
      </CardContainer>
      {isModalOpen && selectedData && (
        <Modal data={selectedData} type={dataType} onClose={handleModalClose} />
      )}
    </>
  );
};

// Styles
const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
`;

const LoadingDiv = styled.div`
  text-align: center;
  font-size: 1.5rem;
  color: ${fleurimondColors.darkGray};
`;

const NoDataMessage = styled.div`
  text-align: center;
  font-size: 1.5rem;
  color: ${fleurimondColors.darkGray};
`;

export default FantasyFootballRanking;
