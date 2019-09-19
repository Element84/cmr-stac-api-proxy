const application = require('../lib/application');

describe('application', () => {
  it('should load the entire application.', () => {
    expect(application).toBeDefined();
  });
});
