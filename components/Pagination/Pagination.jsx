import React from 'react';
import { Pagination as SemanticPagination } from 'semantic-ui-react';
import '../index.css'; // Import the CSS file

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className='pagination-wrapper'>
      <SemanticPagination
        className='custom-pagination'
        activePage={currentPage}
        onPageChange={onPageChange}
        totalPages={totalPages}
      />
    </div>
  );
};

export default Pagination;
