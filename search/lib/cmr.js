const _ = require('lodash');
const axios = require('axios');
const buildUrl = require('build-url');

// TODO items from previous clojure impl to incorporate
// sorting by granule ur
// https://github.com/Element84/catalog-api-spec/blob/dev/implementations/e84/src/e84_api_impl/search_service.clj
// has mappings from JSON response to GeoJSON features

const makeCmrSearchUrl = (path, queryParams = null) => buildUrl(
  'https://cmr.earthdata.nasa.gov/search', { path, queryParams }
);

const headers = {
  'Client-Id': 'cmr-stac-api-proxy'
};

const cmrSearch = async (url, params) => {
  console.log(`CMR Search ${url} ${JSON.stringify(params)}`);
  return axios.get(url, { params, headers });
};

const findCollections = async (params = {}) => {
  // TODO: remove lodash
  const response = await cmrSearch(makeCmrSearchUrl('/collections.json'), Object.assign({}, {has_granules: true, downloadable: true}, params))
  return response.data.feed.entry;
};

const getCollection = async (conceptId) => {
  const collections = await findCollections({ concept_id: conceptId });
  if (collections.length > 0) {
    return collections[0];
  }
  return null;
};

const findGranules = async (params = {}) => {
  const response = await cmrSearch(makeCmrSearchUrl('/granules.json'), params);
  return response.data.feed.entry;
};

module.exports = {
  makeCmrSearchUrl,
  findCollections,
  findGranules,
  getCollection
};
