const { retrieveYaml } = require('../../scripts/yamlUpdater.js');

describe('yamlUpdater', () => {
  // const WFS3YamlUrl = 'https://raw.githubusercontent.com/radiantearth/stac-spec/master/api-spec/openapi/WFS3.yaml';
  // const STACYamlUrl = 'https://raw.githubusercontent.com/radiantearth/stac-spec/blob/master/api-spec/openapi/WFS3.yaml';

  describe('retrieveYaml', () => {
    const WFS3YamlUrl = 'https://raw.githubusercontent.com/radiantearth/stac-spec/master/api-spec/openapi/WFS3.yaml';
    // const STACYamlUrl = 'https://raw.githubusercontent.com/radiantearth/stac-spec/blob/master/api-spec/openapi/WFS3.yaml';

    it('should exist', () => {
      expect(retrieveYaml).toBeDefined();
    });

    it.skip('should accept a url as a parameter', () => {
      // const response = await retrieveYaml()
      // console.log(response)
      expect(() => retrieveYaml()).toThrow();
    });

    it.skip('should return an object', () => {
      const response = retrieveYaml(WFS3YamlUrl);
      console.log(response);
      expect(typeof response).toBe('object');
    });
  });
});
