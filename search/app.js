/* eslint-disable max-len */
const _ = require('lodash');
const fs = require('fs');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

const swagger = yaml.safeLoad(fs.readFileSync('STAC-standalone.yaml'));

const getSearchValidator = (swagger) => {
  const schema = _.merge({
    components: swagger.components
  }, swagger.components.schemas.searchBody);

  return ajv.compile(schema);
};
// // TODO any top level body members other than this must be hand checked for because of JSON schema
// // limitiation
// p = getSearchValidator();
// let validate;
// p.then(v => validate = v)
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
// validate.errors

// Response validation
const getResponseValidator = (swagger) => {
  const schema = _.merge({
    components: swagger.components
  }, swagger.components.schemas.itemCollection);

  return ajv.compile(schema);
};

// validate = getResponseValidator(swagger)
//
// validate({})
// validate.errors
//
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
// validate.errors


// TODO the URL should include the collection identifier.
// in that case the API needs to implement a search for collections (like WFS)


const getRoot = async (event, parsedPath) => {
  console.log(`getRoot ${JSON.stringify(parsedPath, null, 2)}`);
  return {
    statusCode: 200,
    body: JSON.stringify({ hello: 'world' })
  };
};

const getConformance = async (event, parsedPath) => {
  console.log(`getConformance ${JSON.stringify(parsedPath, null, 2)}`);
  return {
    statusCode: 200,
    body: JSON.stringify({ hello: 'world' })
  };
};

const getCollections = async (event, parsedPath) => {
  console.log(`getCollections ${JSON.stringify(parsedPath, null, 2)}`);
  return {
    statusCode: 200,
    body: JSON.stringify({ hello: 'world' })
  };
};

const getCollection = async (event, parsedPath) => {
  console.log(`getCollection ${JSON.stringify(parsedPath, null, 2)}`);
  return {
    statusCode: 200,
    body: JSON.stringify({ hello: 'world' })
  };
};

const getGranules = async (event, parsedPath) => {
  console.log(`getGranules ${JSON.stringify(parsedPath, null, 2)}`);
  return {
    statusCode: 200,
    body: JSON.stringify({ hello: 'world' })
  };
};

const getGranule = async (event, parsedPath) => {
  console.log(`getGranule ${JSON.stringify(parsedPath, null, 2)}`);
  return {
    statusCode: 200,
    body: JSON.stringify({ hello: 'world' })
  };
};

const stacGetSearch = async (event, parsedPath) => {
  console.log(`stacGetSearch ${JSON.stringify(parsedPath, null, 2)}`);
  return {
    statusCode: 200,
    body: JSON.stringify({ hello: 'world' })
  };
};

const stacPostSearch = async (event, parsedPath) => {
  console.log(`stacPostSearch ${JSON.stringify(parsedPath, null, 2)}`);
  return {
    statusCode: 200,
    body: JSON.stringify({ hello: 'world' })
  };
};

const pathToFunction = [
  [/^\/search$/, getRoot],
  [/^\/search\/conformance$/, 'GET', getConformance],
  [/^\/search\/collections$/, 'GET', getCollections],
  [/^\/search\/collections\/([^/]+)$/, 'GET', getCollection],
  [/^\/search\/collections\/([^/]+)\/items$/, 'GET', getGranules],
  [/^\/search\/collections\/([^/]+)\/items\/([^/]+)$/, 'GET', getGranule],
  [/^\/search\/stac$/, 'GET', stacGetSearch],
  [/^\/search\/stac$/, 'POST', stacPostSearch]
];

exports.lambda_handler = async (event, context, callback) => {
  console.log(JSON.stringify(event, null, 2));

  try {
    const { path, requestContext } = event;
    const { httpMethod } = requestContext;
    const potentialMatch = _.chain(pathToFunction)
      .map(([pathRegex, matchHttpMethod, fn]) => {
        if (matchHttpMethod === httpMethod) {
          const match = pathRegex.exec(path);
          if (match) {
            return [match, fn];
          }
        }
        return null;
      }).find().value();

    if (potentialMatch) {
      const [pathMatch, handlerFn] = potentialMatch;
      const response = await handlerFn(event, pathMatch);
      callback(null, response);
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
