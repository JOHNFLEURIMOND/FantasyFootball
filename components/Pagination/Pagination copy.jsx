import React from 'react';
import {Pagination} from 'semantic-ui-react';

const AppPagination = ({statsPerPage, totalStats, paginate}) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalStats / statsPerPage); i++) {
    pageNumbers.push(i);
  }
  //pageNumbers.map((number) => {number})
  return (
    <nav>
      <ul className='pagination'>
        <Pagination onPageChange={(event, data) => pageNumbers.map((number, idx) => console.log(parseInt(number)))} />
        {pageNumbers.map((number) => (
          <>
            <li key={number} className='page-item'>
              <a onClick={() => paginate(number)} className='page-link'>
                {number}
              </a>
            </li>
          </>
        ))}
      </ul>
    </nav>
  );
};

export default AppPagination;
