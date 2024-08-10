// src/components/Pagination/Pagination.jsx
import React from 'react';
import { Pagination as SemanticPagination } from 'semantic-ui-react';

const AppPagination = ({ currentPage, setCurrentPage, totalPages }) => {
  const handlePageChange = (e, { activePage }) => {
    setCurrentPage(activePage); // Ensure this is a function
  };

  return (
    <nav>
      <div className='pagination'>
        <SemanticPagination
          activePage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
        />
      </div>
    </nav>
  );
};

export default AppPagination;
