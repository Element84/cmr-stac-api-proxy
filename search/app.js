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

const swaggerFileContents = fs.readFileSync('WFS3core+STAC.yaml');
const swagger = yaml.safeLoad(swaggerFileContents);

const createSchemaValidator = (schemaElement) => {
  const schema = _.merge({
    components: swagger.components
  }, swagger.components.schemas[schemaElement]);

  return ajv.compile(schema);
};

const makeRawResponse = (content) => ({ _raw: content });

const getDocs = async (event, parsedPath) => {
  console.log(`getDocs ${JSON.stringify(parsedPath, null, 2)}`);
  const file = event.path.replace(/^\/docs/, '');
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
      contents = await fsAsync.readFile(`${__dirname}/node_modules/swagger-ui-dist/${file}`);
    } catch (err) {
      console.log(err);
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

const getRoot = async (event, parsedPath) => {
  console.log(`getRoot ${JSON.stringify(parsedPath, null, 2)}`);
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

const getConformance = async (event, parsedPath) => {
  console.log(`getConformance ${JSON.stringify(parsedPath, null, 2)}`);
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

const getCollections = async (event, parsedPath) => {
  console.log(`getCollections ${JSON.stringify(parsedPath, null, 2)}`);
  const params = adaptParams(wfsParamsToCmrParamsMap, event.queryStringParameters);
  const collections = await cmr.findCollections(params);
  return {
    links: [
      wfs.createLink('self', appUtil.generateAppUrl(event, '/collections'), 'this document')
    ],
    collections: _.map(collections, (coll) => cmrConverter.cmrCollToWFSColl(event, coll))
  };
};

const getCollection = async (event, parsedPath) => {
  console.log(`getCollection ${JSON.stringify(parsedPath, null, 2)}`);
  const conceptId = parsedPath[1];
  const coll = await cmr.getCollection(conceptId);
  if (coll) {
    return cmrConverter.cmrCollToWFSColl(event, coll);
  }
  return null;
};

const getGranules = async (event, parsedPath) => {
  console.log(`getGranules ${JSON.stringify(parsedPath, null, 2)}`);
  const conceptId = parsedPath[1];
  const params = _.merge(
    adaptParams(wfsParamsToCmrParamsMap, event.queryStringParameters),
    { collection_concept_id: conceptId }
  );
  const granules = await cmr.findGranules(params);
  return {
    features: _.map(granules, (gran) => cmrConverter.cmrGranToFeatureGeoJSON(event, gran))
  };
};

const getGranule = async (event, parsedPath) => {
  console.log(`getGranule ${JSON.stringify(parsedPath, null, 2)}`);
  const collConceptId = parsedPath[1];
  const conceptId = parsedPath[2];
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

const stacGetSearch = async (event, parsedPath) => {
  console.log(`stacGetSearch ${JSON.stringify(parsedPath, null, 2)}`);
  const params = adaptParams(stacGetParamMap, event.queryStringParameters);
  return stacBaseSearch(event, params);
};

const stacPostSearch = async (event, parsedPath) => {
  console.log(`stacPostSearch ${JSON.stringify(parsedPath, null, 2)}`);
  return stacBaseSearch(event, JSON.parse(event.body));
};

// An array of different configured APIs endpoints. Each array item contains:
// - a regular expression to match the path
// - the http method supported
// - The handler function to process the request
// - The name of the element within the swagger schema to validate the response.
const pathToFunction = [
  ['empty', 'GET', getRoot, 'root'],
  [/^\/$/, 'GET', getRoot, 'root'],
  [/^\/docs.*$/, 'GET', getDocs],
  [/^\/conformance$/, 'GET', getConformance, 'req-classes'],
  [/^\/collections$/, 'GET', getCollections, 'content'],
  [/^\/collections\/([^/]+)$/, 'GET', getCollection, 'collectionInfo'],
  [/^\/collections\/([^/]+)\/items$/, 'GET', getGranules, 'featureCollectionGeoJSON'],
  [/^\/collections\/([^/]+)\/items\/([^/]+)$/, 'GET', getGranule, 'featureGeoJSON'],
  [/^\/search\/stac$/, 'GET', stacGetSearch, 'itemCollection'],
  [/^\/search\/stac$/, 'POST', stacPostSearch, 'itemCollection']
];

exports.lambda_handler = async (event, context) => {
  console.log(JSON.stringify(event, null, 2));

  try {
    const path = event.path.replace(/\/$/, ''); // Remove last slash
    const { httpMethod } = event.requestContext;
    const potentialMatch = _.chain(pathToFunction)
      .map(([pathRegex, matchHttpMethod, fn, responseSchemaElement]) => {
        if (matchHttpMethod === httpMethod) {
          if (pathRegex === 'empty') {
            if (path === '') {
              return ['empty', fn, responseSchemaElement];
            }
          } else {
            const match = pathRegex.exec(path);
            if (match) {
              return [match, fn, responseSchemaElement];
            }
          }
        }
        return null;
      }).find().value();

      if (potentialMatch) {
        const [pathMatch, handlerFn, responseSchemaElement] = potentialMatch;
        const response = await handlerFn(event, pathMatch);

        if (response && response._raw) {
          return response._raw
        } else if (response) {
        const validator = createSchemaValidator(responseSchemaElement);
        if (!validator(response)) {
          // The response generated is not valid
          return {
            statusCode: 500,
            body: JSON.stringify({
              body: response,
              msg: 'An invalid body was generated processing this request.',
              errors: validator.errors
            })
          }
        }
        // else The response is valid
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(response)
        }
      }
      else {
        // response is null
        return {
          statusCode: 404,
          body: JSON.stringify({
            msg: `Could not find ${path}`
          })
        }
      }
    } else {
      // when does not having a response timeout?
      const err = `Could not find matching request handler for ${httpMethod} ${path}`;
      console.log(err);
      return {
        statusCode: 404,
        body: err
      }
    }
  } catch (err) {
    if (_.get(err, 'response.data.errors')) {
      return {
        statusCode: 400,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(err.response.data.errors)
      }
    } else {
      console.log(err)
      return {
        statusCode: 500,
        body: 'Internal server error'
      }
    }
  }
}

// const _ = require('lodash');
// const cmr = require('./cmr');
// cmrConverter = require('./cmr_converter');
// fakeEvent = {
//   headers: {
//     Host: 'example.com',
//     'x-Forwarded-Proto': 'https'
//   },
//   requestContext: { stage: 'Prod' }
// }

// p = getCollections(fakeEvent, [])
// let result
// p.then(v => result = v)
//
// result.collections[0]
//
//
// p = cmr.findCollections();
// let collections
// p.then(v => collections = v)
//
// coll = collections[0]
//
// cmrConverter._private.cmrCollSpatialToExtents(coll)


