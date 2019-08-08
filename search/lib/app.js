const _ = require('lodash');
const fs = require('fs');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const mime = require('mime-types');
const cmr = require('./cmr');
const cmrConverter = require('./cmr_converter');
const appUtil = require('./app_util');
const fsAsync = appUtil.fsAsync;
const wfs = appUtil.wfs;

const swaggerFileContents = fs.readFileSync('docs/WFS3core+STAC.yaml');
const swagger = yaml.safeLoad(swaggerFileContents);

const createSchemaValidator = (schemaElement) => {
  const schema = _.merge({
    components: swagger.components
  }, swagger.components.schemas[schemaElement]);

  return ajv.compile(schema);
};

const makeRawResponse = (content) => ({ _raw: content });

const getDocs = async (request, response) => {
  console.log('GET /docs');
  const event = request.apiGateway.event;
  const file = event.path.replace(/^\/docs\//, '');
  let contents;
  if (file === '/' || file === '') {
    // Redirect root application to /docs/index.html
    return makeRawResponse({
      statusCode: 302,
      headers: {
        Location: appUtil.generateAppUrl(event, '/docs/index.html')
      },
      body: 'Redirecting...'
    });
  }
  if (file.endsWith('swagger.yaml')) {
    contents = swaggerFileContents;
    // Update the swagger file to be correct for deployed location.
    contents = contents.toString().replace('- <server-location>',
      `- url: '${appUtil.generateAppUrl(event, '')}'`);
  } else {
    try {
      contents = await fsAsync.readFile(`${__dirname}/../node_modules/swagger-ui-dist/${file}`);
    } catch (err) {
      return makeRawResponse({
        statusCode: 404,
        body: `Could not find resource ${event.path}`
      });
    }

    if (file.endsWith('index.html')) {
      contents = contents.toString().replace('https://petstore.swagger.io/v2/swagger.json',
        appUtil.generateAppUrl(event, '/docs/swagger.yaml'))
        .replace(
          '<title>Swagger UI</title>',
          '<title>STAC API - Common Metadata Repository STAC Proxy</title>'
        );
    }
  }

  return makeRawResponse({
    statusCode: 200,
    headers: {
      'Content-Type': mime.lookup(file)
    },
    body: contents.toString()
  });
};

const getRoot = async (request, response) => {
  const event = request.apiGateway.event;
  const accept = _.get(event, 'headers.Accept', 'application/json');
  if (accept.includes('html')) {
    // Redirect root application to /docs/index.html
    return makeRawResponse({
      statusCode: 302,
      headers: {
        Location: appUtil.generateAppUrl(event, '/docs/index.html')
      },
      body: 'Redirecting...'
    });
  }
  // else return JSON.
  return {
    links: [
      wfs.createLink('self', appUtil.generateAppUrl(event, ''), 'this document'),
      wfs.createLink('conformance', appUtil.generateAppUrl(event, '/conformance'),
        'WFS 3.0 conformance classes implemented by this server'),
      wfs.createLink('data', appUtil.generateAppUrl(event, '/collections'),
        'Metadata about the feature collections')
    ]
  };
};

const getConformance = async (request, response) => {
  return {
    conformsTo: [
      'http://www.opengis.net/spec/wfs-1/3.0/req/core',
      'http://www.opengis.net/spec/wfs-1/3.0/req/oas30',
      'http://www.opengis.net/spec/wfs-1/3.0/req/html',
      'http://www.opengis.net/spec/wfs-1/3.0/req/geojson'
    ]
  };
};

const wfsParamsToCmrParamsMap = {
  bbox: ['bounding_box', _.identity],
  time: ['temporal', _.identity],
  limit: ['page_size', _.identity]
};

const adaptParams = (paramConverterMap, params) => _(params)
  .mapValues(appUtil.firstIfArray)
  .toPairs()
  .map(([k, v]) => {
    if (paramConverterMap[k]) {
      const [newName, converter] = paramConverterMap[k];
      return [newName, converter(v)];
    }
    return [k, v];
  })
  .fromPairs()
  .value();

const getCollections = async (request, response) => {
  const event = request.apiGateway.event;
  const params = adaptParams(wfsParamsToCmrParamsMap, event.queryStringParameters);
  const collections = await cmr.findCollections(params);
  return {
    links: [
      wfs.createLink('self', appUtil.generateAppUrl(event, '/collections'), 'this document')
    ],
    collections: _.map(collections, (coll) => cmrConverter.cmrCollToWFSColl(event, coll))
  };
};

const getCollection = async (request, response) => {
  const event = request.apiGateway.event;
  const conceptId = request.params.collectionId;
  const coll = await cmr.getCollection(conceptId);
  if (coll) {
    return cmrConverter.cmrCollToWFSColl(event, coll);
  }
  return null;
};

const getGranules = async (request, response) => {
  const event = request.apiGateway.event;
  const conceptId = request.params.collectionId;
  const params = _.merge(
    adaptParams(wfsParamsToCmrParamsMap, event.queryStringParameters),
    { collection_concept_id: conceptId }
  );
  const granules = await cmr.findGranules(params);
  return {
    features: _.map(granules, (gran) => cmrConverter.cmrGranToFeatureGeoJSON(event, gran))
  };
};

const getGranule = async (request, response) => {
  const event = request.apiGateway.event;
  const collConceptId = request.params.collectionId;
  const conceptId = request.params.itemId;
  const granules = await cmr.findGranules({
    collection_concept_id: collConceptId,
    concept_id: conceptId
  });
  return cmrConverter.cmrGranToFeatureGeoJSON(event, granules[0]);
};

const stacParamsToCmrParamsMap = {
  bbox: ['bounding_box', (v) => v.join(',')],
  time: ['temporal', _.identity],
  intersects: ['polygon', (v) => _.flattenDeep(_.first(v.coordinates)).join(',')],
  limit: ['page_size', _.identity],
  collectionId: ['collection_concept_id', _.identity]
};

const stacBaseSearch = async (event, params) => {
  // TODO verify collection param is present.
  // -  Use the stac schema to validate params. collection param is there.

  const cmrParams = adaptParams(stacParamsToCmrParamsMap, params);
  const granules = await cmr.findGranules(cmrParams);
  return cmrConverter.cmrGranulesToFeatureCollection(event, granules);
};

const stacGetParamMap = {
  limit: ['limit', (v) => parseInt(v, 10)],
  bbox: ['bbox', cmrConverter.parseOrdinateString],
  time: ['time', _.identity]
};

const stacGetSearch = async (request, response) => {
  const event = request.apiGateway.event;
  const params = adaptParams(stacGetParamMap, event.queryStringParameters);
  return stacBaseSearch(event, params);
};

const stacPostSearch = async (request, response) => {
  const event = request.apiGateway.event;
  return stacBaseSearch(event, JSON.parse(event.body));
};

module.exports = {
  getCollections,
  getCollection,
  getGranules,
  getGranule,
  getConformance,
  getDocs,
  getRoot,
  stacGetSearch,
  stacPostSearch,
  createSchemaValidator
};
