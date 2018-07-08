/* eslint-disable max-len */
const _ = require('lodash');
const fs = require('fs');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const cmr = require('./cmr');
const cmrConverter = require('./cmr_converter');
const appUtil = require('./app_util');
const wfs = appUtil.wfs;

const swagger = yaml.safeLoad(fs.readFileSync('WFS3core+STAC.yaml'));

const createSchemaValidator = (schemaElement) => {
  const schema = _.merge({
    components: swagger.components
  }, swagger.components.schemas[schemaElement]);

  return ajv.compile(schema);
};


// Search body example
// // TODO any top level body members other than this must be hand checked for because of JSON schema
// // limitiation
// validate({
//   // TODO the bbox will need extra validation (CMR can do that)
//   bbox: [0,0, 1,1,],
//   // The Time param will need extra validation (But CMR can do that.)
//   time: '2018-02-12T00:00:00Z/2018-03-18T12:31:12Z',
//   intersects: {
//     type: 'polygon',
//     coordinates: [
//       // ring
//       [
//         // points
//         [0,0],
//         [1,1],
//         [0,0],
//         [1,1],
//       ]
//     ]
//   }
// })

// Example search response
// validate({
//   type: 'FeatureCollection',
//   features: [{
//     id: 'G12345-PROV' ,// or granule ur maybe
//     //bbox is optional
//     type: 'Feature',
//     geometry: {
//       // Need to create valid geojson here. Look at previous code that I created
//       type: 'Polygon',
//       coordinates: [
//         [
//           [-122.308150179, 37.488035566],
//           [-122.597502109, 37.538869539],
//           [-122.576687533, 37.613537207],
//           [-122.2880486, 37.562818007],
//           [-122.308150179, 37.488035566]
//         ]
//       ]
//     },
//     links: [
//       // TODO figure out what kinds of links to include. Ideas:
//       // - Metadata in CMR
//       // - Any downloadable data available in the metadata
//       // - browse images
//       // - parent collection
//       {
//         href: '',
//         rel: 'prev?',
//         type: 'the file type',
//       }
//     ],
//     properties: {
//       datetime: '2018-02-12T00:00:00Z/2018-03-18T12:31:12Z', // Granule start date, range or periodic See time param.
//       provider: 'PROV1',
//       license: 'Licensed per dataset. See parent collection resources.'
//     },
//     assets: {
//       analytic: {
//         name: '4-Band Analytic',
//         href: 'http...something.tif'
//       },
//       thumbnail: {
//         name: 'thumbnail',
//         href: 'http...something.png'
//       }
//     }
//   }],
//   links: {
//     next: 'http://example.com/get-more-results-here'
//   }
// })

const getRoot = async (event, parsedPath) => {
  console.log(`getRoot ${JSON.stringify(parsedPath, null, 2)}`);
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

// TODO for collections
// - provider parameter
// - limit and offset parameters

const getCollections = async (event, parsedPath) => {
  console.log(`getCollections ${JSON.stringify(parsedPath, null, 2)}`);
  const collections = await cmr.findCollections();
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

// TODO for getGranules
//  - limit and offset parameters
// - any parameters supported by CMR EXCEPT the ones that we will use (collection_concept_id)

const getGranules = async (event, parsedPath) => {
  console.log(`getGranules ${JSON.stringify(parsedPath, null, 2)}`);
  return { hello: 'world' };
};

const getGranule = async (event, parsedPath) => {
  console.log(`getGranule ${JSON.stringify(parsedPath, null, 2)}`);
  return { hello: 'world' };
};

const stacGetSearch = async (event, parsedPath) => {
  console.log(`stacGetSearch ${JSON.stringify(parsedPath, null, 2)}`);
  return { hello: 'world' };
};

const stacPostSearch = async (event, parsedPath) => {
  console.log(`stacPostSearch ${JSON.stringify(parsedPath, null, 2)}`);
  return { hello: 'world' };
};

// An array of different configured APIs endpoints. Each array item contains:
// - a regular expression to match the path
// - the http method supported
// - The handler function to process the request
// - The name of the element within the swagger schema to validate the response.
const pathToFunction = [
  [/^\/search$/, 'GET', getRoot, 'root'],
  [/^\/search\/conformance$/, 'GET', getConformance, 'req-classes'],
  [/^\/search\/collections$/, 'GET', getCollections, 'content'],
  [/^\/search\/collections\/([^/]+)$/, 'GET', getCollection, 'collectionInfo'],
  [/^\/search\/collections\/([^/]+)\/items$/, 'GET', getGranules, 'featureCollectionGeoJSON'],
  [/^\/search\/collections\/([^/]+)\/items\/([^/]+)$/, 'GET', getGranule, 'featureGeoJSON'],
  [/^\/search\/stac$/, 'GET', stacGetSearch, 'itemCollection'],
  [/^\/search\/stac$/, 'POST', stacPostSearch, 'itemCollection']
];

exports.lambda_handler = async (event, context, callback) => {
  console.log(JSON.stringify(event, null, 2));

  try {
    const path = event.path.replace(/\/$/, ''); // Remove last slash
    const { httpMethod } = event.requestContext;
    const potentialMatch = _.chain(pathToFunction)
      .map(([pathRegex, matchHttpMethod, fn, responseSchemaElement]) => {
        if (matchHttpMethod === httpMethod) {
          const match = pathRegex.exec(path);
          if (match) {
            return [match, fn, responseSchemaElement];
          }
        }
        return null;
      }).find().value();

    if (potentialMatch) {
      const [pathMatch, handlerFn, responseSchemaElement] = potentialMatch;
      const response = await handlerFn(event, pathMatch);

      if (response) {
        const validator = createSchemaValidator(responseSchemaElement);
        if (!validator(response)) {
          // The response generated is not valid
          callback(null, {
            statusCode: 500,
            body: JSON.stringify({
              body: response,
              msg: 'An invalid body was generated processing this request.',
              errors: validator.errors
            })
          });
        }
        // else The response is valid
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(response)
        });
      }
      else {
        // response is null
        callback(null, {
          statusCode: 404,
          body: JSON.stringify({
            msg: `Could not find ${path}`
          })
        });
      }
    }
    else {
      const err = `Could not find matching request handler for ${httpMethod} ${path}`;
      console.log(err);
      callback(null, {
        statusCode: 404,
        body: err
      });
    }
  }
  catch (err) {
    console.log(err);
    callback(err, null);
  }
};

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
