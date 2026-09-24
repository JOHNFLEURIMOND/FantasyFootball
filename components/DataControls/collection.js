export function selectRows(
  rows,
  { search = '', name, filters = [], sort, direction = 'desc' }
) {
  const query = search.trim().toLowerCase();
  return rows
    .filter(
      row =>
        (!query ||
          String(name(row) || '')
            .toLowerCase()
            .includes(query)) &&
        filters.every(({ value, get }) => !value || get(row) === value)
    )
    .sort((a, b) => {
      const left = sort(a),
        right = sort(b);
      const missing = value =>
        value === null ||
        value === undefined ||
        value === '' ||
        (typeof value === 'number' && !Number.isFinite(value));
      if (missing(left) || missing(right))
        return Number(missing(left)) - Number(missing(right));
      const comparison =
        typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right));
      return (
        comparison * (direction === 'asc' ? 1 : -1) ||
        String(name(a) || '').localeCompare(String(name(b) || ''))
      );
    });
}
