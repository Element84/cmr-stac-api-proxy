const { retrieveYaml } = require('../../scripts/yamlUpdater.js');

describe('yamlUpdater', () => {
  describe('retrieveYaml', () => {
    const WFS3YamlUrl = 'https://raw.githubusercontent.com/radiantearth/stac-spec/master/api-spec/openapi/WFS3.yaml';
    // const STACYamlUrl = 'https://raw.githubusercontent.com/radiantearth/stac-spec/blob/master/api-spec/openapi/WFS3.yaml';

    it('should exist', () => {
      expect(retrieveYaml).toBeDefined();
    });

    it('should return an object', async () => {
      const response = await retrieveYaml(WFS3YamlUrl);
      expect(typeof response).toBe('object');
    });
  });
});
