// AppPagination.jsx
import React from 'react';
import { Pagination as SemanticPagination } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const AppPagination = React.memo(
  ({ currentPage, setCurrentPage, totalPages }) => {
    console.log('Current Page:', currentPage);
    console.log('Total Pages:', totalPages);

    const handlePageChange = (e, { activePage }) => {
      setCurrentPage(activePage);
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
  }
);

AppPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  totalPages: PropTypes.number.isRequired,
};

export default AppPagination;
