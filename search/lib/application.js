const express = require('express');
const api = require('./api');

async function initialize () {
  const application = express();

  application.use(api.wfs);

  return application;
}

module.exports = initialize;
