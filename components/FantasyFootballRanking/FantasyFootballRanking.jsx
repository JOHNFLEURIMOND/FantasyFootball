import React, { useContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { NewsContext } from '../context';
import {
  CardContainer,
  CardWrapper,
  CardInner,
  CardFront,
  CardBack,
  LoadingDiv,
} from '../Card/index';
import Modal from '../Card/Modal';

const FantasyFootballRanking = () => {
  const [isCardFlipped, setIsCardFlipped] = useState(-1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const { news, loaded, fetchNews } = useContext(NewsContext);

  useEffect(() => {
    fetchNews(); // No need to pass the API key here
  }, [fetchNews]);

  const handleClick = useCallback(index => {
    setIsCardFlipped(prevIndex => (prevIndex === index ? -1 : index));
  }, []);

  const handleModalOpen = useCallback(newsItem => {
    setSelectedNews(newsItem);
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedNews(null);
  }, []);

  if (!loaded) {
    return <LoadingDiv>Loading...</LoadingDiv>;
  }

  return (
    <>
      <CardContainer>
        {news.map((d, index) => (
          <CardWrapper key={d.NewsID || index}>
            <CardInner $isExpanded={isCardFlipped === index}>
              {/* Card Front */}
              <CardFront onClick={() => handleClick(index)}>
                <h3>{d.Title}</h3>
                <p>Source: {d.Source}</p>
                <p>Posted: {d.TimeAgo}</p>
              </CardFront>
              {/* Card Back */}
              <CardBack>
                <p>{d.Content}</p>
                <p>Author: {d.Author}</p>
                <p>Team: {d.Team}</p>
                <a
                  href={d.OriginalSourceUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Original Source
                </a>
                <button onClick={() => handleModalOpen(d)}>Details</button>
              </CardBack>
            </CardInner>
          </CardWrapper>
        ))}
      </CardContainer>

      {isModalOpen && selectedNews && (
        <Modal
          title={selectedNews.Title || 'No Title'}
          content={selectedNews.Content || 'No Content'}
          source={selectedNews.Source || 'No Source'}
          updated={selectedNews.TimeAgo || 'No Date'}
          url={selectedNews.Url || '#'}
          originalSource={selectedNews.OriginalSourceUrl || '#'}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

FantasyFootballRanking.propTypes = {
  news: PropTypes.array.isRequired,
  loaded: PropTypes.bool.isRequired,
  fetchNews: PropTypes.func.isRequired,
};

export default FantasyFootballRanking;
