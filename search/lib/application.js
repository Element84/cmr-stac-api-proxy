const express = require('express');
const awsServerless = require('aws-serverless-express');
const awsServerlessMiddleware = require('aws-serverless-express/middleware');

const settings = require('./settings');
const { createLogger } = require('./util');
const logger = createLogger(settings.logger);

const api = require('./api');
const { errorHandler } = require('./error-handler');

async function initialize () {
  logger.debug('Initialize Application');

  const application = express();

  application.use(awsServerlessMiddleware.eventContext());
  application.use(api.routes);
  application.use(errorHandler);

  application.logger = logger;

  return application;
}

/**
 * Lambda Handler for STAC CMR Search Proxy
 * @param event
 * @param context
 * @returns {Promise<*>}
 */
module.exports.handler = async (event, context) => {
  const application = await initialize();
  const server = awsServerless.createServer(application);
  return awsServerless.proxy(server, event, context, 'PROMISE').promise;
};
