import React from 'react';
import '../index.css';

function getVisiblePages(currentPage, totalPages) {
  const pages = new Set([1, totalPages]);
  for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }
  return [...pages].sort((a, b) => a - b);
}

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  const safeTotalPages = Math.max(Number(totalPages) || 1, 1);
  const safeCurrentPage = Math.min(
    Math.max(Number(currentPage) || 1, 1),
    safeTotalPages
  );
  const pages = getVisiblePages(safeCurrentPage, safeTotalPages);

  const changePage = (event, page) => {
    if (page === safeCurrentPage || page < 1 || page > safeTotalPages) {
      return;
    }
    onPageChange(event, { activePage: page });
  };

  return (
    <nav className='pagination-wrapper' aria-label='Pagination'>
      <div className='custom-pagination'>
        <button
          type='button'
          onClick={event => changePage(event, safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          aria-label='Previous page'
        >
          Previous
        </button>
        {pages.map((page, index) => {
          const previousPage = pages[index - 1];
          const showEllipsis = previousPage && page - previousPage > 1;
          return (
            <React.Fragment key={page}>
              {showEllipsis && <span aria-hidden='true'>…</span>}
              <button
                type='button'
                onClick={event => changePage(event, page)}
                aria-current={page === safeCurrentPage ? 'page' : undefined}
                disabled={page === safeCurrentPage}
                aria-label={`Page ${page}`}
              >
                {page}
              </button>
            </React.Fragment>
          );
        })}
        <button
          type='button'
          onClick={event => changePage(event, safeCurrentPage + 1)}
          disabled={safeCurrentPage === safeTotalPages}
          aria-label='Next page'
        >
          Next
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
