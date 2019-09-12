const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

const loadOpenApiYaml = (swaggerYaml) => {
  if (!swaggerYaml) throw new Error('Missing Yaml path');
  let yamlSchemaFile;
  if (path.isAbsolute(swaggerYaml)) {
    yamlSchemaFile = swaggerYaml;
  } else {
    yamlSchemaFile = path.join(__dirname, swaggerYaml);
  }

  return yaml.safeLoad(fs.readFileSync(yamlSchemaFile));
};

const getSchema = (schemaName) => {
  if (!schemaName) throw new Error('Missing schema name');
  if (!schemaName.components) throw new Error('No schema found');
  return schemaName.components;
};

const createSchemaValidator = (schema) => {
  if (!schema) throw new Error('Missing a schema.');
  return ajv.compile(schema);
};

const validateSchema = (componentName, collectionObj, yamlSchemaFile = '../../docs/WFS3core+STAC.yaml') => {
  if (!componentName || !collectionObj) throw new Error('Missing parameters');
  const load = loadOpenApiYaml(yamlSchemaFile);
  const schemaComponents = getSchema(load);
  const validator = createSchemaValidator(schemaComponents.schemas[componentName]);
  return validator(collectionObj);
};

module.exports = {
  createSchemaValidator,
  getSchema,
  loadOpenApiYaml,
  validateSchema
};
