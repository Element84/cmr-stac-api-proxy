const express = require('express');
const { wfs, generateAppUrl } = require('../util');
const cmr = require('../cmr');
const { cmrCollToWFSColl } = require('../convert');

async function getCollections (request, response) {
  const event = request.apiGateway.event;
  const params = cmr.convertParams(cmr.WFS_PARAMS_CONVERSION_MAP, request.query);
  const collections = await cmr.findCollections(params);
  const collectionsResponse = {
    links: [
      wfs.createLink('self', generateAppUrl(event, '/collections'), 'this document')
    ],
    collections: collections.map(coll => cmrCollToWFSColl(event, coll))
  };
  response.status(200).json(collectionsResponse);
}

async function getCollection (request, response) {
  const event = request.apiGateway.event;
  const conceptId = request.params.collectionId;
  const collection = await cmr.getCollection(conceptId);
  const collectionResponse = cmrCollToWFSColl(event, collection);
  response.status(200).json(collectionResponse);
}

const CONFORMANCE_RESPONSE = {
  conformsTo: [
    'http://www.opengis.net/spec/wfs-1/3.0/req/core',
    'http://www.opengis.net/spec/wfs-1/3.0/req/oas30',
    'http://www.opengis.net/spec/wfs-1/3.0/req/html',
    'http://www.opengis.net/spec/wfs-1/3.0/req/geojson'
  ]
};

const routes = express.Router();
routes.get('/collections', (req, res) => getCollections(req, res));
routes.get('/collections/:collectionId', (req, res) => getCollection(req, res));
routes.get('/collections/:collectionId/items', (req, res) => {});
routes.get('/collections/:collectionId/items/:itemId', (req, res) => {});
routes.get('/conformance', (req, res) => res.status(200).json(CONFORMANCE_RESPONSE));

module.exports = {
  getCollections,
  getCollection,
  routes
};
