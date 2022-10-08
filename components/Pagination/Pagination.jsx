import React from 'react';
import { Pagination } from 'semantic-ui-react';

const AppPagination = ({ currentPage, setCurrentPage, totalPages }) => {
  const changePage = (e, { activePage }) => setCurrentPage(activePage);
  console.log(
    'this is the total pages and current pages in Pagination.jsx',
    totalPages,
    currentPage
  );
  return (
    <nav>
      <div className='pagination'>
        <Pagination
          defaultActivePage={currentPage}
          onPageChange={changePage}
          totalPages={totalPages}
        />
      </div>
    </nav>
  );
};

export default AppPagination;
