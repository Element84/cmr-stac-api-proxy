const { retrieveYaml } = require('../../scripts/yamlUpdater.js');

describe('yamlUpdater', () => {
  const WFS3YamlUrl = 'https://raw.githubusercontent.com/radiantearth/stac-spec/master/api-spec/openapi/WFS3.yaml';
  // const STACYamlUrl = 'https://raw.githubusercontent.com/radiantearth/stac-spec/blob/master/api-spec/openapi/WFS3.yaml';

  describe('retrieveYaml', () => {

    it('should exist', () => {
      expect(retrieveYaml).toBeDefined();
    });

    it('should accept a url as a parameter', () => {
      expect(() => retrieveYaml()).toThrow('Missing yaml url');
    });

    it('should return an object', () => {
      const response = retrieveYaml(WFS3YamlUrl);
      console.log(response);
      expect(typeof response).toBe('object');
    });
  });
});
