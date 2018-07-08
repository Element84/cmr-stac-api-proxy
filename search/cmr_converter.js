const _ = require('lodash');
const appUtil = require('./app_util');
const wfs = appUtil.wfs;
const cmr = require('./cmr');

const WHOLE_WORLD_BBOX = [-180, 90, 180, -90];

const addPointsToBbox = (bbox, points) => {
  let w; let n; let e; let s;
  if (bbox) {
    [w, n, e, s] = bbox;
  }
  points.forEach(([lat, lon]) => {
    if (w) {
      w = Math.min(w, lon);
      n = Math.max(n, lat);
      e = Math.max(e, lon);
      s = Math.min(s, lat);
    }
    else {
      [w, n, e, s] = [lon, lat, lon, lat];
    }
  });
  return [w, n, e, s];
};

const mergeBoxes = (box1, box2) => {
  if (_.isNull(box1)) {
    return box2;
  }
  return [
    Math.min(box1[0], box2[0]),
    Math.max(box1[1], box2[1]),
    Math.max(box1[2], box2[2]),
    Math.min(box1[3], box2[3])
  ];
};

const parseOrdinateString = (numStr) => _.map(numStr.split(' '), parseFloat);

const pointStringToPoints = (pointStr) => _.chunk(parseOrdinateString(pointStr), 2);

// TODO this needs to be tested

const cmrCollSpatialToExtents = (cmrColl) => {
  let bbox = null;
  if (cmrColl.polygons) {
    // an array of arrays of strings containing rings
    // [["lat1 lon1 lat2 lon2 ..."]]
    // In the inner most array all you need is the first string. That's the outer boundary
    bbox = _.chain(cmrColl.polygons)
      .map((rings) => rings[0])
      .map(pointStringToPoints)
      .reduce(addPointsToBbox, bbox)
      .value();
  }
  if (cmrColl.points) {
    // an array of strings of "lat lon"
    // [ "53.63 -106.2" ]
    const points = _.map(cmrColl.points, parseOrdinateString);
    bbox = addPointsToBbox(bbox, points);
  }
  if (cmrColl.lines) {
    throw new Error(`Unepxected spatial extent of lines in ${cmrColl.id}`);
  }
  if (cmrColl.boxes) {
    // a list of strings of south west north east
    // TODO can cross antimeridian
    // [ "-14.3601 -176.6525 64.823 151.78372" ]
    bbox = _.reduce(cmrColl.boxes, (box, boxStr) => mergeBoxes(box, parseOrdinateString(boxStr)),
      bbox);
  }
  if (_.isNull(bbox)) {
    // whole world bbox
    bbox = WHOLE_WORLD_BBOX;
  }
  return bbox;
};

const cmrCollToWFSColl = (event, cmrColl) => ({
  name: cmrColl.id,
  title: cmrColl.dataset_id,
  description: cmrColl.summary,
  links: [
    wfs.createLink('self', appUtil.generateAppUrl(event, `/collections/${cmrColl.id}`),
      'Info about this collection'),
    wfs.createLink('items', appUtil.generateAppUrl(event, `/collections/${cmrColl.id}/items`),
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

module.exports = {
  cmrCollToWFSColl,
  //For testing
  _private: {
    addPointsToBbox,
    WHOLE_WORLD_BBOX,
    cmrCollSpatialToExtents
  }
};
