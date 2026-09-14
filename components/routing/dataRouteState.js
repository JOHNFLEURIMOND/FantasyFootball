export function resolveDataRouteState({
  loading = false,
  error = null,
  items = [],
  stale = false,
  partial = false,
} = {}) {
  if (loading) {
    return { primary: 'loading', stale: false, partial: false };
  }

  if (error) {
    return { primary: 'failure', stale: false, partial: false };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { primary: 'empty', stale: false, partial: false };
  }

  return {
    primary: 'success',
    stale: Boolean(stale),
    partial: Boolean(partial),
  };
}
