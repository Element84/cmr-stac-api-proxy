const { cmrGranToFeatureGeoJSON } = require('../convert');
const { generateAppUrl, extractParam, generateSelfUrl } = require('../util');

// Move to collection_converter?
const cmrGranulesToFeatureCollection = (event, cmrGrans) => {
  const currPage = parseInt(extractParam(event.queryStringParameters, 'page_num', '1'), 10);
  const nextPage = currPage + 1;
  const newParams = { ...event.queryStringParameters } || {};
  newParams.page_num = nextPage;
  const nextResultsLink = generateAppUrl(event, event.path, newParams);

  return {
    type: 'FeatureCollection',
    features: cmrGrans.map(g => cmrGranToFeatureGeoJSON(event, g)),
    links: {
      self: generateSelfUrl(event),
      next: nextResultsLink
    }
  };
};

module.exports = {
  cmrGranulesToFeatureCollection
};
