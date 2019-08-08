const app = require('../../index.js');

describe('Tests index', function () {
  it('verifies successful response', async () => {
    expect(app).toBeDefined();
  });
});
