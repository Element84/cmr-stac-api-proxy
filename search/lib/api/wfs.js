const express = require('express');
const { adaptParams, wfsParamsToCmrParamsMap, wfs, generateAppUrl } = require('../util');
const cmr = require('../cmr/cmr');
const { cmrCollToWFSColl } = require('../cmr/cmr_converter');

async function getCollections (request, response) {
  const event = request.apiGateway.event;
  const params = adaptParams(wfsParamsToCmrParamsMap, request.query);
  const collections = await cmr.findCollections(params);
  return {
    links: [
      wfs.createLink('self', generateAppUrl(event, '/collections'), 'this document')
    ],
    collections: collections.map(coll => cmrCollToWFSColl(event, coll))
  };
}

async function getCollection (request, response) {
  const event = request.apiGateway.event;
  const conceptId = request.params.collectionId;
  const coll = await cmr.getCollection(conceptId);
  if (coll) {
    return cmrCollToWFSColl(event, coll);
  }
  return null;
}

const routes = express.Router();
routes.get('/collections', (req, res) => getCollections(req, res));
routes.get('/collections/:collectionId', (req, res) => getCollection(req, res));
routes.get('/collections/:collectionId/items', () => {});
routes.get('/collections/:collectionId/items/:itemId', () => {});

module.exports = {
  getCollections,
  getCollection,
  routes
};
