const fs = require('fs');
const mime = require('mime-types');
const _ = require('lodash');

const { makeRawResponse, generateAppUrl, fsAsync, wfs } = require('../app_util');
const collections = require('./collections');
const stac = require('./stac');

const swaggerFileContents = fs.readFileSync('docs/WFS3core+STAC.yaml');

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
        Location: generateAppUrl(event, '/docs/index.html')
      },
      body: 'Redirecting...'
    });
  }
  if (file.endsWith('swagger.yaml')) {
    contents = swaggerFileContents;
    // Update the swagger file to be correct for deployed location.
    contents = contents.toString().replace('- <server-location>',
      `- url: '${generateAppUrl(event, '')}'`);
  } else {
    try {
      contents = await fsAsync.readFile(`${__dirname}/../../node_modules/swagger-ui-dist/${file}`);
    } catch (err) {
      return makeRawResponse({
        statusCode: 404,
        body: `Could not find resource ${event.path}`
      });
    }

    if (file.endsWith('index.html')) {
      contents = contents.toString().replace('https://petstore.swagger.io/v2/swagger.json',
        generateAppUrl(event, '/docs/swagger.yaml'))
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
        Location: generateAppUrl(event, '/docs/index.html')
      },
      body: 'Redirecting...'
    });
  }
  // else return JSON.
  return {
    links: [
      wfs.createLink('self', generateAppUrl(event, ''), 'this document'),
      wfs.createLink('conformance', generateAppUrl(event, '/conformance'),
        'WFS 3.0 conformance classes implemented by this server'),
      wfs.createLink('data', generateAppUrl(event, '/collections'),
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

module.exports = {
  getRoot,
  getDocs,
  getConformance,
  collections,
  stac
};
