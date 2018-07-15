const _ = require('lodash');
const axios = require('axios');


// TODO items from previous clojure impl to incorporate
// sorting by granule ur
// https://github.com/Element84/catalog-api-spec/blob/dev/implementations/e84/src/e84_api_impl/search_service.clj
// has mappings from JSON response to GeoJSON features


const makeCmrSearchUrl = (path) => `https://cmr.earthdata.nasa.gov/search${path}`;

const headers = {
  'Client-Id': 'cmr-stac-api-proxy'
};

const findCollections = async (params = {}) => {
  const response = await axios.get(makeCmrSearchUrl('/collections.json'), {
    params: _.merge({
      has_granules: true
    }, params),
    headers
  });
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
  const response = await axios.get(makeCmrSearchUrl('/granules.json'), {
    params: _.merge({
      // TODO any default params?
    }, params),
    headers
  });
  return response.data.feed.entry;
};

module.exports = {
  makeCmrSearchUrl,
  findCollections,
  findGranules,
  getCollection
};
