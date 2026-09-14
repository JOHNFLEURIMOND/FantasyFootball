export const PROJECTION_PAGE_SIZE = 12;

export function deriveProjectionPage({
  stats = [],
  search = '',
  position = '',
  sortBy = 'FantasyPointsPPR',
  currentPage = 1,
  pageSize = PROJECTION_PAGE_SIZE,
}) {
  const normalizedSearch = search.trim().toLowerCase();
  const filteredStats = stats
    .filter(player => {
      const matchesSearch =
        !normalizedSearch || player.Name?.toLowerCase().includes(normalizedSearch);
      const matchesPosition = !position || player.Position === position;
      return matchesSearch && matchesPosition;
    })
    .sort((a, b) => {
      const left = Number(a?.[sortBy]);
      const right = Number(b?.[sortBy]);
      if (!Number.isFinite(left) && !Number.isFinite(right)) return 0;
      if (!Number.isFinite(left)) return 1;
      if (!Number.isFinite(right)) return -1;
      if (right !== left) return right - left;
      return String(a.Name || '').localeCompare(String(b.Name || ''));
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
