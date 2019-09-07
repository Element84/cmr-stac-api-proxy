const path = require('path');
const express = require('express');

const { createLink, generateAppUrl } = require('../util');

const stac = require('./stac');
const wfs = require('./wfs');

function createRootResponse (event) {
  return {
    links: [
      createLink('self', generateAppUrl(event, ''), 'this document'),
      createLink('conformance', generateAppUrl(event, '/conformance'), 'WFS 3.0 conformance classes implemented by this server'),
      createLink('data', generateAppUrl(event, '/collections'), 'Metadata about the feature collections')
    ]
  };
}

const routes = express.Router();

routes.use(stac.routes);
routes.use(wfs.routes);
routes.get('/docs', express.static(path.join(__dirname, '../../docs'), { redirect: false }));
routes.get('/', (req, res) =>
  req.accepts('json') ? res.status(200).json(createRootResponse(req.apiGateway.event)) : res.redirect('/docs'));

module.exports = {
  routes
};
