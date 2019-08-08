const express = require('express');
const awsServerless = require('aws-serverless-express');
const awsServerlessMiddleware = require('aws-serverless-express/middleware');

const appFunctions = require('./lib/app');
const { errorHandler } = require('./lib/error-handler');

const application = express();

function wrapper (handlerFunction, responseSchemaElement) {
  return async (req, res, next) => {
    try {
      const response = await handlerFunction(req, res);

      if (response && response._raw) {
        Object.keys(response._raw.headers).forEach((key) => res.set(key, response._raw.headers[key]));
        res.status(response._raw.statusCode).send(response._raw.body);
      } else if (response) {
        const validator = appFunctions.createSchemaValidator(responseSchemaElement);
        if (!validator(response)) {
          res.status(500).json({
            body: response,
            msg: 'An invalid body was generated processing this request.',
            errors: validator.errors
          });
        } else {
          res.status(200).json(response);
        }
      } else {
        res.status(404).json({ msg: 'Could not find handler function' });
      }
    } catch (error) {
      next(error);
    }
  };
}

application.use(awsServerlessMiddleware.eventContext());

application.get('/', wrapper(appFunctions.getRoot, 'root'));
application.get('/docs/*', wrapper(appFunctions.getDocs));
application.get('/conformance', wrapper(appFunctions.getConformance, 'req-classes'));
application.get('/collections', wrapper(appFunctions.getCollections, 'content'));
application.get('/collections/:collectionId', wrapper(appFunctions.getCollection, 'collectionInfo'));
application.get('/collections/:collectionId/items', wrapper(appFunctions.getGranule, 'featureCollectionGeoJSON'));
application.get('/collections/:collectionId/items/:itemId', wrapper(appFunctions.getGranule, 'featureGeoJSON'));
application.get('/search/stac', wrapper(appFunctions.stacGetSearch, 'itemCollection'));
application.post('/search/stac', wrapper(appFunctions.stacPostSearch, 'itemCollection'));

application.use(errorHandler);

const server = awsServerless.createServer(application);

module.exports.handler = async (event, context) => {
  return awsServerless.proxy(server, event, context, 'PROMISE').promise;
};
