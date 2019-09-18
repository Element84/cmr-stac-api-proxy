const { createLogger } = require('../../lib/util/logger');

describe('createLogger', () => {
  it('should create a logger.', () => {
    const loggerOptions = {};
    expect(createLogger(loggerOptions)).toBeDefined();
  });

  it.todo('should create a logger with debug level.');
});
