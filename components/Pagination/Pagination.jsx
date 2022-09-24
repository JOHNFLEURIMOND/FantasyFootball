import React from 'react';
import { Pagination } from 'semantic-ui-react';

const AppPagination = ({ statsPerPage, totalStats, paginate }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalStats / statsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <nav>
            <ul className='pagination'>
                {pageNumbers.map((number) => (
                    <>
                        <Pagination key={number} onPageChange={() => paginate(number)} defaultActivePage={1} totalPages={number} />
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
