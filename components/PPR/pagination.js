export const PPR_PAGE_SIZE = 12;

export function derivePprPage({
  stats = [],
  search = '',
  position = '',
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

      return matchesSearch && matchesPosition;
    })
    .sort((a, b) => {
      if (
        sortBy &&
        a[sortBy] !== undefined &&
        b[sortBy] !== undefined
      ) {
        return Number(b[sortBy]) - Number(a[sortBy]);
      }

      return 0;
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
