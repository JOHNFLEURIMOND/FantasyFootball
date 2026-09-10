const { createSafeError } = require('./errors');

function parseContract(
  schema,
  value,
  { code, message, resource, status = 500 }
) {
  const result = schema.safeParse(value);

  if (result.success) {
    return result.data;
  }

  const error = createSafeError({
    code,
    message,
    status,
    retryable: false,
    resource,
  });
  error.cause = result.error;
  throw error;
}

module.exports = {
  parseContract,
};
