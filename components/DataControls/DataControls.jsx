import React from 'react';
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme';

export default function DataControls({
  search,
  onSearch,
  searchLabel = 'Search players',
  filters = [],
  sort,
  onSort,
  sortOptions,
  direction,
  onDirection,
  onReset,
  children,
}) {
  return (
    <Controls aria-label='Search, filter, and sort'>
      {children}
      <label>
        {searchLabel}
        <input
          type='search'
          value={search}
          onChange={event => onSearch(event.target.value)}
        />
      </label>
      {filters.map(filter => (
        <label key={filter.label}>
          {filter.label}
          <select
            value={filter.value}
            onChange={event => filter.onChange(event.target.value)}
          >
            <option value=''>{filter.allLabel}</option>
            {filter.options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ))}
      <label>
        Sort by
        <select value={sort} onChange={event => onSort(event.target.value)}>
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Sort direction
        <select
          value={direction}
          onChange={event => onDirection(event.target.value)}
        >
          <option value='desc'>Descending</option>
          <option value='asc'>Ascending</option>
        </select>
      </label>
      <button type='button' onClick={onReset}>
        Reset filters
      </button>
    </Controls>
  );
}
const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 1rem;
  margin: 1rem auto;
  padding: 1rem;
  max-width: 1200px;
  text-align: left;
  background: ${fleurimondColors.surface};
  border-radius: 0.75rem;
  label {
    display: grid;
    gap: 0.5rem;
    flex: 1 1 160px;
    min-width: 0;
  }
  input,
  select,
  button {
    font: inherit;
    min-width: 0;
    max-width: 100%;
    padding: 0.7rem;
    border-radius: 0.4rem;
    border: 1px solid ${fleurimondColors.surfaceBorder};
    background: ${fleurimondColors.background};
    color: ${fleurimondColors.text};
  }
  button {
    cursor: pointer;
  }
  :is(input, select, button):focus-visible {
    outline: 3px solid ${fleurimondColors.accent};
    outline-offset: 3px;
  }
`;
