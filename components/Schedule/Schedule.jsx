import React, { useContext, useEffect, useCallback } from 'react';
import { NewsContext } from '../context';
import ScheduleCardWithModal from './ScheduleCard';
import Pagination from '../Pagination/Pagination';
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme';
import Nav from '../Navbar/Nav';
import Footer from '../Footer/Footer';
import MainHero from '../MainHero/MainHero';

const Schedule = () => {
  const {
    schedules,
    loaded,
    fetchSchedules,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useContext(NewsContext);

  useEffect(() => {
    fetchSchedules(currentPage);
  }, [fetchSchedules, currentPage]);

  const handlePageChange = useCallback(
    (e, { activePage }) => {
      setCurrentPage(activePage);
    },
    [setCurrentPage]
  );

  if (!loaded) {
    return <LoadingDiv>Loading...</LoadingDiv>;
  }

  return (
    <>
      <Nav />
      <MainHero />
      <ContentWrapper>
        <CardContainer>
          {schedules.map(game => (
            <ScheduleCardWithModal key={game.GameKey} data={game} />
          ))}
        </CardContainer>
        <PaginationWrapper>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </PaginationWrapper>
      </ContentWrapper>
      <Footer />
    </>
  );
};

const ContentWrapper = styled.div`
  padding: 2rem 1rem; /* Adds padding around the content */
  background-color: ${fleurimondColors.lightGray}; /* Light background for contrast */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem; /* Spacing between the grid and pagination */
  min-height: 100vh; /* Ensures the container takes at least full viewport height */
  box-sizing: border-box; /* Includes padding and border in the element's total width and height */
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 columns of equal width */
  gap: 1rem;
  width: 100%;
  max-width: 1200px; /* Limits the container width */
  margin: 0 auto; /* Centers the grid horizontally */
`;

const PaginationWrapper = styled.div`
  width: 100%;
  max-width: 1200px; /* Same max width as CardContainer for alignment */
  margin: 0 auto; /* Centers the pagination horizontally */
  padding: 1rem 0; /* Adds vertical padding to ensure space around the pagination */
`;

const LoadingDiv = styled.div`
  text-align: center;
  font-size: 1.5rem;
  color: ${fleurimondColors.darkGray};
  padding: 2rem;
  background-color: ${fleurimondColors.lightGray}; /* Background color to match ContentWrapper */
`;

export default Schedule;
