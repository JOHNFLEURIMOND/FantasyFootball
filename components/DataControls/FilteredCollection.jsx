import React, { useState } from 'react';
import DataControls from './DataControls';
import { selectRows } from './collection';
import Pagination from '../Pagination/Pagination';

export default function FilteredCollection({
  rows,
  name,
  searchLabel,
  filterFields,
  sortOptions,
  children,
}) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(sortOptions[0].value);
  const [direction, setDirection] = useState('desc');
  const [page, setPage] = useState(1);
  const change = setter => value => {
    setter(value);
    setPage(1);
  };
  const filtered = selectRows(rows, {
    search,
    name,
    direction,
    filters: filterFields.map(field => ({
      ...field,
      value: filters[field.label] || '',
    })),
    sort: (sortOptions.find(option => option.value === sort) || sortOptions[0])
      .get,
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / 25));
  const activePage = Math.min(page, totalPages);
  return (
    <>
      <DataControls
        search={search}
        onSearch={change(setSearch)}
        searchLabel={searchLabel}
        filters={filterFields.map(field => ({
          ...field,
          value: filters[field.label] || '',
          options: [...new Set(rows.map(field.get).filter(Boolean))].sort(),
          onChange: value => {
            setFilters(current => ({ ...current, [field.label]: value }));
            setPage(1);
          },
        }))}
        sort={sort}
        onSort={change(setSort)}
        sortOptions={sortOptions}
        direction={direction}
        onDirection={change(setDirection)}
        onReset={() => {
          setSearch('');
          setFilters({});
          setSort(sortOptions[0].value);
          setDirection('desc');
          setPage(1);
        }}
      />
      <p role='status'>
        {filtered.length} matching results. Page {activePage} of {totalPages}.
      </p>
      {filtered.length ? (
        children(filtered.slice((activePage - 1) * 25, activePage * 25))
      ) : (
        <p>No results match these filters.</p>
      )}
      {filtered.length > 25 ? (
        <Pagination
          currentPage={activePage}
          totalPages={totalPages}
          onPageChange={(_event, { activePage: value }) => setPage(value)}
        />
      ) : null}
    </>
  );
}
