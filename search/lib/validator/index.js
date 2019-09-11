const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

const loadOpenApiYaml = (swaggerYaml) => {
  if (!swaggerYaml) throw new Error('Missing Yaml path');
  let yamlFile;
  if (path.isAbsolute(swaggerYaml)) {
    yamlFile = swaggerYaml;
  } else {
    yamlFile = path.join(__dirname, swaggerYaml);
  }

  return yaml.safeLoad(fs.readFileSync(yamlFile));
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

module.exports = {
  createSchemaValidator,
  getSchema,
  loadOpenApiYaml
};
