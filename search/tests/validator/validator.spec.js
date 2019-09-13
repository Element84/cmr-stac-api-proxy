const path = require('path');
const { createSchemaValidator, loadOpenApiYaml, getSchema, validateSchema } = require('../../lib/validator');

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
    expect(validator.errors).toEqual(null);
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

  it.skip('should be able to accept an absolute path', () => {
    expect(loadOpenApiYaml(path.join(__dirname, '../../tests/validator/test.yaml'))).toEqual({ test: 'test' });
  });
});

describe('getSchema', () => {
  const validSchema = {
    components: {
      test: 'test'
    }
  };

  const invalidSchema = {
    test: 'test'
  };

  it('should exist', () => {
    // console.log(getSchema)
    expect(getSchema).toBeDefined();
  });

  it('should require a schema component as a parameter', () => {
    expect(() => getSchema()).toThrow();
  });

  it('should check to make sure there is a component schema(s) available', () => {
    expect(() => getSchema(invalidSchema)).toThrow();
  });

  it('should grab a schema from a loaded file', () => {
    expect(getSchema(validSchema)).toEqual({ test: 'test' });
  });
});

describe('validateSchema', () => {
  const testObj = {
    type: 'Point'
  };

  it('should exist', () => {
    expect(validateSchema).toBeDefined();
  });

  it('should take in a componentName and collectionObject as parameters', () => {
    expect(() => validateSchema()).toThrow();
  });

  it('should take in a WFS3/STAC component name and a collection object and return a boolean', () => {
    expect(typeof validateSchema('geometryGeoJSON', testObj)).toEqual('boolean');
  });

  it('should validate the test object against the schema for the given component', () => {
    expect(validateSchema('geometryGeoJSON', testObj)).toEqual(true);
  });
});
