const _ = require('lodash');
const cmr = require('./cmr');
const { parseOrdinateString } = require('../../lib/convert/bounding-box');
const { wfs, generateAppUrl, extractParam, generateSelfUrl } = require('../util');
const { WHOLE_WORLD_BBOX, pointStringToPoints, addPointsToBbox, mergeBoxes } = require('./bounding-box');
const {cmrGranToFeatureGeoJSON} = require('../cmr/cmr_converter')

const cmrCollSpatialToExtents = (cmrColl) => {
  let bbox = null;
  if (cmrColl.polygons) {
    // an array of arrays of strings containing rings
    // [["lat1 lon1 lat2 lon2 ..."]]
    // In the inner most array all you need is the first string. That's the outer boundary
    bbox = cmrColl.polygons
      .map((rings) => rings[0])
      .map(pointStringToPoints)
      .reduce(addPointsToBbox, bbox);
  }
  if (cmrColl.points) {
    // an array of strings of "lat lon"
    // [ "53.63 -106.2"
    const points = cmrColl.points.map(parseOrdinateString);
    bbox = addPointsToBbox(bbox, points);
  }
  if (cmrColl.lines) {
    throw new Error(`Unepxected spatial extent of lines in ${cmrColl.id}`);
  }
  if (cmrColl.boxes) {
    // a list of strings of south west north east
    // TODO can cross antimeridian
    // [ "-14.3601 -176.6525 64.823 151.78372" ]

    bbox = cmrColl.boxes.reduce((box, boxStr) => mergeBoxes(box, parseOrdinateString(boxStr)), bbox);
  }
  if (_.isNull(bbox)) {
    // whole world bbox
    bbox = WHOLE_WORLD_BBOX;
  }
  return bbox;
};

const stacSearchWithCurrentParams = (event, collId) => {
  const newParams = [...event.queryStringParameters] || {};
  newParams.collectionId = collId;
  // The provider param isn't needed once the colleciton id is set.
  delete newParams.provider;
  return generateAppUrl(event, '/search/stac', newParams);
};

const cmrGranuleSearchWithCurrentParams = (event, collId) => {
  const newParams = [...event.queryStringParameters] || {};
  newParams.collection_concept_id = collId;
  // The provider param isn't needed once the colleciton id is set.
  delete newParams.collectionId;
  delete newParams.provider;
  return cmr.makeCmrSearchUrl('granules.json', newParams);
};

const cmrCollToWFSColl = (event, cmrColl) => ({
  name: cmrColl.id,
  title: cmrColl.dataset_id,
  description: cmrColl.summary,
  links: [
    wfs.createLink('self', generateAppUrl(event, `/collections/${cmrColl.id}`),
      'Info about this collection'),
    wfs.createLink('stac', stacSearchWithCurrentParams(event, cmrColl.id),
      'STAC Search this collection'),
    wfs.createLink('cmr', cmrGranuleSearchWithCurrentParams(event, cmrColl.id),
      'CMR Search this collection'),
    wfs.createLink('items', generateAppUrl(event, `/collections/${cmrColl.id}/items`),
      'Granules in this collection'),
    wfs.createLink('overview', cmr.makeCmrSearchUrl(`/concepts/${cmrColl.id}.html`),
      'HTML metadata for collection'),
    wfs.createLink('metadata', cmr.makeCmrSearchUrl(`/concepts/${cmrColl.id}.native`),
      'Native metadata for collection'),
    wfs.createLink('metadata', cmr.makeCmrSearchUrl(`/concepts/${cmrColl.id}.umm_json`),
      'JSON metadata for collection')
  ],
  extent: {
    crs: 'http://www.opengis.net/def/crs/OGC/1.3/CRS84',
    spatial: cmrCollSpatialToExtents(cmrColl),
    trs: 'http://www.opengis.net/def/uom/ISO-8601/0/Gregorian',
    temporal: [
      cmrColl.time_start,
      (cmrColl.time_end || cmrColl.time_start)
    ]
  }
});

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
  cmrCollSpatialToExtents,
  stacSearchWithCurrentParams,
  cmrGranuleSearchWithCurrentParams,
  cmrCollToWFSColl,
  cmrGranulesToFeatureCollection
};
