function createSafeError({
  code,
  message,
  status = 500,
  retryable = false,
  resource = undefined,
}) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  error.retryable = retryable;
  if (resource) {
    error.resource = resource;
  }
  error.isSafeError = true;
  return error;
}

function toSafeError(error) {
  if (!error) {
    return {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
      status: 500,
      retryable: false,
    };
  }

  if (error.isSafeError) {
    return {
      code: error.code,
      message: error.message,
      status: error.status,
      retryable: Boolean(error.retryable),
    };
  }

  if (error.name === 'AbortError') {
    return {
      code: 'UPSTREAM_TIMEOUT',
      message: 'The upstream provider timed out.',
      status: 504,
      retryable: true,
    };
  }

  if (Number.isInteger(error.status)) {
    return {
      code: error.status === 404 ? 'UPSTREAM_NOT_FOUND' : 'UPSTREAM_ERROR',
      message:
        error.status === 404
          ? 'The requested resource could not be found.'
          : 'The upstream provider returned an error.',
      status: error.status,
      retryable: [408, 429, 500, 502, 503, 504].includes(error.status),
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred.',
    status: 500,
    retryable: false,
  };
}

function isTransientError(error) {
  const safeError = toSafeError(error);
  return safeError.retryable === true;
}

module.exports = {
  createSafeError,
  isTransientError,
  toSafeError,
};