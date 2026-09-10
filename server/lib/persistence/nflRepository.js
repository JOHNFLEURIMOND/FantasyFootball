const { parseContract } = require('../contractValidation');
const {
  CANONICAL_SCHEMA_VERSION,
  fantasyMatchupSchema,
  gameSchema,
  playerSchema,
  statSchema,
  teamSchema,
} = require('../domainSchemas');
const { createSafeError } = require('../errors');

const DEFAULT_LIST_LIMIT = 100;
const MAX_LIST_LIMIT = 500;
const ENTITY_CONFIGURATIONS = {
  players: {
    entityType: 'player',
    idField: 'playerId',
    schema: playerSchema,
  },
  teams: {
    entityType: 'team',
    idField: 'teamId',
    schema: teamSchema,
  },
  games: {
    entityType: 'game',
    idField: 'gameId',
    schema: gameSchema,
  },
  fantasyMatchups: {
    entityType: 'fantasy_matchup',
    idField: 'matchupId',
    schema: fantasyMatchupSchema,
  },
  stats: {
    entityType: 'stat',
    idField: 'statId',
    schema: statSchema,
  },
};

function createPersistenceError({
  code,
  message,
  resource,
  cause,
  retryable = false,
  status = code === 'PERSISTENCE_CONFLICT' ? 409 : 500,
}) {
  const error = createSafeError({
    code,
    message,
    status,
    retryable,
    resource,
  });
  error.cause = cause;
  return error;
}

function normalizeEntityId(entityId, resource) {
  if (typeof entityId !== 'string' || entityId.trim().length === 0) {
    throw createPersistenceError({
      code: 'PERSISTENCE_ID_INVALID',
      message: 'A non-empty canonical entity ID is required.',
      resource,
    });
  }

  return entityId.trim();
}

function normalizeListOptions(options, resource) {
  const { limit = DEFAULT_LIST_LIMIT, afterId } = options || {};

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIST_LIMIT) {
    throw createPersistenceError({
      code: 'PERSISTENCE_QUERY_INVALID',
      message: `The list limit must be an integer from 1 through ${MAX_LIST_LIMIT}.`,
      resource,
      status: 400,
    });
  }

  return {
    limit,
    afterId:
      afterId === undefined ? undefined : normalizeEntityId(afterId, resource),
  };
}

function runDatabaseOperation(operation, resource) {
  try {
    return operation();
  } catch (cause) {
    if (cause.isSafeError) {
      throw cause;
    }

    throw createPersistenceError({
      code: 'PERSISTENCE_UNAVAILABLE',
      message: 'The canonical data store is unavailable.',
      resource,
      cause,
      retryable: ['SQLITE_BUSY', 'SQLITE_LOCKED'].includes(cause.code),
      status: 503,
    });
  }
}

function createEntityRepository({
  database,
  entityType,
  idField,
  schema,
  now,
}) {
  const insertRecord = database.prepare(`
    INSERT INTO canonical_records (
      entity_type,
      entity_id,
      schema_version,
      payload_json,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);
  const findRecord = database.prepare(`
    SELECT entity_id, schema_version, payload_json
    FROM canonical_records
    WHERE entity_type = ? AND entity_id = ?
  `);
  const listRecords = database.prepare(`
    SELECT entity_id, schema_version, payload_json
    FROM canonical_records
    WHERE entity_type = ?
    ORDER BY entity_id
    LIMIT ?
  `);
  const listRecordsAfterId = database.prepare(`
    SELECT entity_id, schema_version, payload_json
    FROM canonical_records
    WHERE entity_type = ? AND entity_id > ?
    ORDER BY entity_id
    LIMIT ?
  `);

  function parseEntity(entity, code, message) {
    return parseContract(schema, entity, {
      code,
      message,
      resource: entityType,
    });
  }

  function decodeRecord(record) {
    if (record.schema_version !== CANONICAL_SCHEMA_VERSION) {
      throw createPersistenceError({
        code: 'PERSISTENCE_SCHEMA_UNSUPPORTED',
        message: 'The persisted canonical schema version is not supported.',
        resource: entityType,
      });
    }

    let payload;
    try {
      payload = JSON.parse(record.payload_json);
    } catch (cause) {
      throw createPersistenceError({
        code: 'PERSISTENCE_RECORD_INVALID',
        message: 'A persisted canonical record could not be decoded.',
        resource: entityType,
        cause,
      });
    }

    const canonicalEntity = parseEntity(
      payload,
      'PERSISTENCE_RECORD_INVALID',
      'A persisted canonical record is invalid.'
    );

    if (canonicalEntity[idField] !== record.entity_id) {
      throw createPersistenceError({
        code: 'PERSISTENCE_RECORD_INVALID',
        message: 'A persisted canonical record has inconsistent identity.',
        resource: entityType,
      });
    }

    return canonicalEntity;
  }

  return Object.freeze({
    create(entity) {
      const canonicalEntity = parseEntity(
        entity,
        'PERSISTENCE_ENTITY_INVALID',
        'The canonical entity is invalid and was not persisted.'
      );
      const entityId = canonicalEntity[idField];
      const timestamp = new Date(now()).toISOString();

      runDatabaseOperation(() => {
        try {
          insertRecord.run(
            entityType,
            entityId,
            CANONICAL_SCHEMA_VERSION,
            JSON.stringify(canonicalEntity),
            timestamp,
            timestamp
          );
        } catch (cause) {
          if (cause.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
            throw createPersistenceError({
              code: 'PERSISTENCE_CONFLICT',
              message: 'The canonical entity already exists.',
              resource: entityType,
              cause,
            });
          }
          throw cause;
        }
      }, entityType);

      return canonicalEntity;
    },

    findById(entityId) {
      return runDatabaseOperation(() => {
        const record = findRecord.get(
          entityType,
          normalizeEntityId(entityId, entityType)
        );
        return record ? decodeRecord(record) : null;
      }, entityType);
    },

    list(options = {}) {
      const { limit, afterId } = normalizeListOptions(options, entityType);

      return runDatabaseOperation(() => {
        const records =
          afterId === undefined
            ? listRecords.all(entityType, limit)
            : listRecordsAfterId.all(entityType, afterId, limit);
        return records.map(decodeRecord);
      }, entityType);
    },
  });
}

function createNflRepositories({ database, now = () => Date.now() } = {}) {
  if (!database || typeof database.prepare !== 'function') {
    throw new Error('An open SQLite database is required.');
  }

  return Object.freeze(
    Object.fromEntries(
      Object.entries(ENTITY_CONFIGURATIONS).map(([name, configuration]) => [
        name,
        createEntityRepository({ database, now, ...configuration }),
      ])
    )
  );
}

module.exports = {
  createNflRepositories,
};
