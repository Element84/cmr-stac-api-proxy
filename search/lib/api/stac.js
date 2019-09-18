const express = require('express');
const cmr = require('../cmr');
const cmrConverter = require('../convert');
const { createRootCatalog, Catalog } = require('../stac').catalog;

async function search (event, params) {
  const cmrParams = cmr.convertParams(cmr.STAC_SEARCH_PARAMS_CONVERSION_MAP, params);
  const granules = await cmr.findGranules(cmrParams);
  return cmrConverter.cmrGranulesToFeatureCollection(event, granules);
}

async function getSearch (request, response) {
  const event = request.apiGateway.event;
  const params = cmr.convertParams(cmr.STAC_QUERY_PARAMS_CONVERSION_MAP, request.query);
  const result = await search(event, params);
  response.status(200).json(result);
}

async function postSearch (request, response) {
  const event = request.apiGateway.event;
  const result = await search(event, JSON.parse(request.body));
  response.status(200).json(result);
}

function getRootCatalog (request, response) {
  const rootCatalog = createRootCatalog();
  rootCatalog.addChild('Default Catalog', '/default');
  response.status(200).json(rootCatalog);
}

function createDefaultCatalog () {
  const catalog = new Catalog();
  catalog.id = 'default';
  catalog.title = 'Default Catalog';
  catalog.description = 'Default catalog for a no parameter search against common metadata repository.';
  catalog.createRoot('http://localhost:3000/stac');
  catalog.createSelf('http://localhost:3000/stac/default');
  return catalog;
}

async function getCatalog (request, response) {
  // FIXME: const catalogId = request.params.catalogId;
  const cmrCollections = await cmr.findCollections();
  const catalog = createDefaultCatalog();

  cmrCollections.forEach((item) => {
    catalog.addChild(item.title, `/${item.id}`);
  });

  response.status(200).json(catalog);
}

const routes = express.Router();

routes.get('/stac/search', (req, res) => getSearch(req, res));
routes.post('/stac/search', (req, res) => postSearch(req, res));

routes.get('/stac', (req, res) => getRootCatalog(req, res));
routes.get('/stac/:catalogId', (req, res) => getCatalog(req, res));
routes.get('/stac/:catalogId/:collectionId', (req, res) => res.redirect(`/collections/${req.params.collectionId}`));

module.exports = {
  getRootCatalog,
  getCatalog,
  routes
};
