const _ = require('lodash');
const { adaptParams } = require('../util');
const cmr = require('../cmr');
const cmrConverter = require('../cmr_converter');

const stacParamsToCmrParamsMap = {
  bbox: ['bounding_box', (v) => v.join(',')],
  time: ['temporal', _.identity],
  intersects: ['polygon', (v) => _.flattenDeep(_.first(v.coordinates)).join(',')],
  limit: ['page_size', _.identity],
  collectionId: ['collection_concept_id', _.identity]
};

const stacBaseSearch = async (event, params) => {
  // TODO verify collection param is present.
  // -  Use the stac schema to validate params. collection param is there.

  const cmrParams = adaptParams(stacParamsToCmrParamsMap, params);
  const granules = await cmr.findGranules(cmrParams);
  return cmrConverter.cmrGranulesToFeatureCollection(event, granules);
};

const stacGetParamMap = {
  limit: ['limit', (v) => parseInt(v, 10)],
  bbox: ['bbox', cmrConverter.parseOrdinateString],
  time: ['time', _.identity]
};

const stacGetSearch = async (request, response) => {
  const event = request.apiGateway.event;
  const params = adaptParams(stacGetParamMap, event.queryStringParameters);
  return stacBaseSearch(event, params);
};

const stacPostSearch = async (request, response) => {
  const event = request.apiGateway.event;
  return stacBaseSearch(event, JSON.parse(event.body));
};

module.exports = {
  stacGetSearch,
  stacPostSearch
};
