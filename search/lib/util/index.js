const app = require('./app');
const { UrlBuilder } = require('./url-builder');
const { WfsLink } = require('./wfs-link');

function createUrl (host, path, queryParams) {
  return UrlBuilder.create()
    .withProtocol('http')
    .withHost(host)
    .withPath(path)
    .withQuery(queryParams)
    .build();
}

function createSecureUrl (host, path, queryParams) {
  return UrlBuilder.create()
    .withProtocol('https')
    .withHost(host)
    .withPath(path)
    .withQuery(queryParams)
    .build();
}

function generateAppUrl (event, path, queryParams = null) {
  const host = event.headers.Host;
  const protocol = event.headers['X-Forwarded-Proto'] || 'http';
  const newPath = host.includes('amazonaws.com') ? `${event.requestContext.stage}/${path}` : path;
  return protocol === 'https' ? createSecureUrl(host, newPath, queryParams) : createUrl(host, newPath, queryParams);
}

function generateSelfUrl (event) {
  return generateAppUrl(event, event.path, event.queryStringParameters);
}

function identity (x) {
  return x;
}

module.exports = {
  ...app,
  createUrl,
  createSecureUrl,
  generateAppUrl,
  generateSelfUrl,
  identity,
  WfsLink
};
