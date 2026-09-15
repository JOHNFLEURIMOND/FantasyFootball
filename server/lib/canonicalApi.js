const { z } = require('zod');
const {
  gameSchema,
  playerSchema,
  statSchema,
  teamSchema,
} = require('./domainSchemas');
const { createSafeError } = require('./errors');

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 25;

const standingsSchema = z.object({
  teamId: z.string().min(1),
  name: z.string().min(1),
  conference: z.string().nullable(),
  division: z.string().nullable(),
  wins: z.number().int().nonnegative(),
  losses: z.number().int().nonnegative(),
  ties: z.number().int().nonnegative(),
  pointsFor: z.number().finite(),
  pointsAgainst: z.number().finite(),
  gamesPlayed: z.number().int().nonnegative(),
  winPercentage: z.number().finite().min(0).max(1),
}).strict();

const projectionSchema = z.object({
  playerId: z.string().min(1),
  displayName: z.string().min(1),
  position: z.string().nullable(),
  teamId: z.string().nullable(),
  season: z.string().regex(/^\d{4}$/),
  week: z.number().int().min(1).max(30),
  scoringFormat: z.literal('ppr'),
  dataType: z.literal('estimated-projection'),
  estimated: z.literal(true),
  methodology: z.string().min(1),
  sourceWeeks: z.array(z.number().int().min(1).max(30)),
  sourceSampleSize: z.number().int().nonnegative(),
  metrics: z.record(z.string(), z.number().finite()),
  fantasyPointsPpr: z.number().finite(),
}).strict();

const rankingSchema = z.object({
  playerId: z.string().min(1),
  displayName: z.string().min(1),
  position: z.string().nullable(),
  teamId: z.string().nullable(),
  season: z.string().regex(/^\d{4}$/),
  throughWeek: z.number().int().min(0).max(30),
  metrics: z.record(z.string(), z.number().finite()),
  fantasyPointsPpr: z.number().finite(),
  scoringFormat: z.literal('ppr'),
  dataType: z.literal('observed-ranking'),
  rank: z.number().int().positive(),
}).strict();

const scheduleGameSchema = gameSchema.safeExtend({
  homeTeam: teamSchema.nullable(),
  awayTeam: teamSchema.nullable(),
});

function invalidRequest(message) {
  return createSafeError({
    code: 'INVALID_REQUEST',
    message,
    status: 400,
    retryable: false,
  });
}

function parsePositiveInteger(value, fallback, { max } = {}) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || (max && parsed > max)) {
    throw invalidRequest('Invalid pagination parameter.');
  }
  return parsed;
}

function parsePagination(query = {}) {
  return {
    page: parsePositiveInteger(query.page, 1),
    pageSize: parsePositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE, {
      max: MAX_PAGE_SIZE,
    }),
  };
}

function paginate(items, query = {}) {
  const { page, pageSize } = parsePagination(query);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const boundedPage = Math.min(page, totalPages);
  const start = (boundedPage - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    page: boundedPage,
    pageSize,
    total,
    totalPages,
  };
}

function validateCollection(schema, items, resource) {
  const result = z.array(schema).safeParse(items);
  if (!result.success) {
    throw createSafeError({
      code: 'CANONICAL_RESPONSE_INVALID',
      message: `Canonical ${resource} data failed response validation.`,
      status: 502,
      retryable: false,
      resource,
    });
  }
  return result.data;
}

function validateOne(schema, value, resource) {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw createSafeError({
      code: 'CANONICAL_RESPONSE_INVALID',
      message: `Canonical ${resource} data failed response validation.`,
      status: 502,
      retryable: false,
      resource,
    });
  }
  return result.data;
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

module.exports = {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  invalidRequest,
  normalizeText,
  paginate,
  parsePagination,
  projectionSchema,
  rankingSchema,
  scheduleGameSchema,
  standingsSchema,
  validateCollection,
  validateOne,
  playerSchema,
  statSchema,
  teamSchema,
};
