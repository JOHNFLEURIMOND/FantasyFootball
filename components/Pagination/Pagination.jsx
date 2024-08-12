import React, { useContext } from 'react';
import { Pagination as SemanticPagination } from 'semantic-ui-react';
import { StatsContext } from '../context';
import styled from '@emotion/styled';

// Styled wrapper for the pagination
const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

// Custom styles for Semantic UI Pagination
const CustomPagination = styled(SemanticPagination)`
  .pagination > .item {
    border-radius: 50%;
    margin: 0 8px;
    font-size: 20px; /* Increase font size */
    width: 50px; /* Increase width */
    height: 50px; /* Increase height */
    line-height: 50px; /* Center text vertically */
    text-align: center; /* Center text horizontally */
    padding: 0; /* Remove default padding */
  }

  .pagination > .item.active {
    background-color: #007bff !important;
    color: #ffffff !important;
    border: 2px solid #007bff !important; /* Increase border thickness */
  }

  .pagination > .item:hover {
    background-color: #f1f1f1;
  }

  .pagination > .item.ellipsis {
    margin: 0 12px;
    font-size: 20px; /* Match font size with other items */
  }

  .ui pagination css-150zxzj menu {
    font-size: 3em;
  }

  .item {
    margin: 3px;
  }
`;

const AppPagination = () => {
  const { currentPage, setCurrentPage, totalPages } = useContext(StatsContext);

  const handlePageChange = (e, { activePage }) => {
    setCurrentPage(activePage);
  };

  return (
    <PaginationWrapper>
      <CustomPagination
        activePage={currentPage}
        onPageChange={handlePageChange}
        totalPages={totalPages}
        boundaryRange={0}
        siblingRange={2}
      />
    </PaginationWrapper>
  );
};

export default AppPagination;
