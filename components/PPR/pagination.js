export const PPR_PAGE_SIZE = 12;

export function derivePprPage({
  stats = [],
  search = '',
  position = '',
  team = '',
  direction = 'desc',
  sortBy = '',
  currentPage = 1,
  pageSize = PPR_PAGE_SIZE,
}) {
  const normalizedSearch = search.trim().toLowerCase();
  const filteredStats = stats
    .filter(player => {
      const matchesSearch =
        !normalizedSearch ||
        player.Name?.toLowerCase().includes(normalizedSearch);
      const matchesPosition = !position || player.Position === position;

      return matchesSearch && matchesPosition && (!team || player.Team === team);
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      const left = a[sortBy], right = b[sortBy];
      const missing = value => value === null || value === undefined || value === '' || !Number.isFinite(Number(value));
      if (missing(left) || missing(right)) return Number(missing(left)) - Number(missing(right));
      return (Number(left) - Number(right)) * (direction === 'asc' ? 1 : -1);

    });

  const totalPages = Math.max(1, Math.ceil(filteredStats.length / pageSize));
  const activePage = Math.min(Math.max(Number(currentPage) || 1, 1), totalPages);
  const start = (activePage - 1) * pageSize;

  return {
    activePage,
    items: filteredStats.slice(start, start + pageSize),
    totalItems: filteredStats.length,
    totalPages,
  };
}
