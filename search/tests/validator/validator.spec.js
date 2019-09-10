const { createSchemaValidator, loadOpenApiYaml } = require('../../lib/validator');

describe('createSchemaValidator', () => {
  const testSchema = {
    properties: {
      name: {
        type: 'string'
      },
      price: {
        type: 'number'
      }
    }
  };

  it('should exist', () => {
    expect(() => createSchemaValidator).toBeDefined();
  });

  it('should require one input parameter', () => {
    expect(() => createSchemaValidator()).toThrow();
  });

  it('return a validation function', () => {
    expect(typeof createSchemaValidator(testSchema)).toEqual('function');
  });

  it('should validate an object', () => {
    const validObj = {
      name: 'coffee',
      price: 2.20
    };
    const validator = createSchemaValidator(testSchema);
    expect(validator(validObj)).toEqual(true);
    expect(validator.errors).toEqual(null)
  });

  it('should invalidate an object', () => {
    const invalidObj = {
      name: 42,
      price: 'hello'
    };
    const validator = createSchemaValidator(testSchema);
    expect(validator(invalidObj)).toEqual(false);
    expect(validator.errors).toEqual(
      [{ keyword: 'type',
        dataPath: '.name',
        schemaPath: '#/properties/name/type',
        params: { type: 'string' },
        message: 'should be string' },
      { keyword: 'type',
        dataPath: '.price',
        schemaPath: '#/properties/price/type',
        params: { type: 'number' },
        message: 'should be number' }]
    );
  });
});

describe('loadOpenApiYaml', () => {
  it('should exist', () => {
    expect(() => loadOpenApiYaml).toBeDefined();
  });

  it('should require a single parameter', () => {
    expect(() => loadOpenApiYaml()).toThrow();
  });

  it('should be able to load a file with a relative path', () => {
    expect(loadOpenApiYaml('../../tests/validator/test.yaml')).toEqual({ test: 'test' });
  });

  it('should be able to accept an absolute path', () => {
    expect(loadOpenApiYaml('/Users/drew/Projects/cmr/cmr-stac-api-proxy/search/tests/validator/test.yaml')).toEqual({ test: 'test' });
  });
});
