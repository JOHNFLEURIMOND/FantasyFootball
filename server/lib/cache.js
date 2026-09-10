const { isTransientError } = require('./errors');

function createResourceCache({ now = () => Date.now() } = {}) {
  const store = new Map();

  function buildMeta(entry, cacheStatus, currentTime) {
    if (!entry) {
      return {
        cacheStatus,
        fromCache: false,
        fetchedAt: null,
        ageMs: 0,
        ttlMs: 0,
        staleAgeMs: 0,
      };
    }

    const ttlMs = entry.ttlMs || 0;
    const ageMs = Math.max(0, currentTime - entry.createdAt);
    const staleAgeMs = Math.max(0, currentTime - entry.expiresAt);

    return {
      cacheStatus,
      fromCache: cacheStatus !== 'miss',
      fetchedAt: new Date(entry.createdAt).toISOString(),
      ageMs,
      ttlMs,
      staleAgeMs: cacheStatus === 'stale' ? staleAgeMs : 0,
    };
  }

  async function getOrLoad(key, loader, options = {}) {
    const { ttlMs = 0, staleTtlMs = 0 } = options;
    const currentTime = now();
    const entry = store.get(key);

    if (entry?.value !== undefined && entry.expiresAt > currentTime) {
      return {
        value: entry.value,
        meta: buildMeta(entry, 'fresh', currentTime),
      };
    }

    if (entry?.pending) {
      return entry.pending;
    }

    const pending = (async () => {
      try {
        const value = await loader({
          staleValue: entry?.value ?? null,
          meta: buildMeta(entry, entry ? 'stale' : 'miss', currentTime),
        });
        store.set(key, {
          value,
          createdAt: now(),
          expiresAt: now() + ttlMs,
          staleUntil: now() + ttlMs + staleTtlMs,
          ttlMs,
          staleTtlMs,
        });

        const refreshedEntry = store.get(key);
        return {
          value,
          meta: buildMeta(refreshedEntry, 'fresh', now()),
        };
      } catch (error) {
        const staleEligible =
          entry?.value !== undefined &&
          entry.staleUntil > currentTime &&
          isTransientError(error);

        if (staleEligible) {
          return {
            value: entry.value,
            meta: buildMeta(entry, 'stale', currentTime),
          };
        }

        throw error;
      } finally {
        const latestEntry = store.get(key);
        if (latestEntry?.pending) {
          delete latestEntry.pending;
        }
      }
    })();

    store.set(key, {
      ...(entry || {}),
      pending,
      ttlMs,
      staleTtlMs,
    });

    return pending;
  }

  function clear() {
    store.clear();
  }

  return {
    clear,
    getOrLoad,
  };
}

module.exports = {
  createResourceCache,
};
