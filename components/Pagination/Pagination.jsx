import React from 'react';
import { Pagination } from 'semantic-ui-react';

const AppPagination = ({ currentPage, setCurrentPage, totalPages }) => {
  const changePage = (e, { activePage }) => setCurrentPage(activePage);

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
