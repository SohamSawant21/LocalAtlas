export class AuthRequiredError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthRequiredError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'You do not have permission to perform this action') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message);
    this.name = 'RateLimitError';
  }
}
