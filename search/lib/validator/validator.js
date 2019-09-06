const fs = require('fs');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

// grabs docs
const swaggerFileContents = fs.readFileSync('./docs/WFS3core+STAC.yaml');
// create a JSON object
const swagger = yaml.safeLoad(swaggerFileContents);

// schemaElement is the path in the YAML to the schema of the component being validated
const createSchemaValidator = (schemaElement) => {
  // console.log(swagger)
  const schema = Object.assign({}, { components: swagger.components }, swagger.components.schemas[schemaElement]);
  // validates schema
  return ajv.compile(schema);
};

module.exports = {
  createSchemaValidator
};
