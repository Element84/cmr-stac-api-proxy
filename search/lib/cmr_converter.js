const _ = require('lodash');
const { wfs, generateAppUrl, extractParam, generateSelfUrl } = require('./util');
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
    } else {
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

const parseOrdinateString = (numStr) => numStr.split(/\s|,/).map(parseFloat);

const pointStringToPoints = (pointStr) => _.chunk(parseOrdinateString(pointStr), 2);

// TODO this needs to be tested

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

// TODO remove page_num params from these

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

const cmrPolygonToGeoJsonPolygon = (polygon) => {
  const rings = polygon.map((ringStr) => pointStringToPoints(ringStr).map(([lat, lon]) => [lon, lat]));
  return {
    type: 'Polygon',
    coordinates: rings
  };
};

const cmrBoxToGeoJsonPolygon = (box) => {
  const [s, w, n, e] = parseOrdinateString(box);
  return {
    type: 'Polygon',
    coordinates: [[
      [w, s],
      [e, s],
      [e, n],
      [w, n],
      [w, s]
    ]]
  };
};

const cmrSpatialToGeoJSONGeometry = (cmrGran) => {
  let geometry = [];
  if (cmrGran.polygons) {
    geometry = geometry.concat(cmrGran.polygons.map(cmrPolygonToGeoJsonPolygon));
  }
  if (cmrGran.boxes) {
    geometry = geometry.concat(cmrGran.boxes.map(cmrBoxToGeoJsonPolygon));
  }
  if (cmrGran.points) {
    geometry = geometry.concat(cmrGran.points.map((ps) => {
      const [lat, lon] = parseOrdinateString(ps);
      return { type: 'Point', coordinates: [lon, lat] };
    }));
  }
  if (geometry.length === 0) {
    throw new Error(`Unknown spatial ${JSON.stringify(cmrGran)}`);
  }
  if (geometry.length === 1) {
    return geometry[0];
  }
  return {
    type: 'GeometryCollection',
    geometries: geometry
  };
};

const DATA_REL = 'http://esipfed.org/ns/fedsearch/1.1/data#';
const BROWSE_REL = 'http://esipfed.org/ns/fedsearch/1.1/browse#';
const DOC_REL = 'http://esipfed.org/ns/fedsearch/1.1/documentation#';

const cmrGranToFeatureGeoJSON = (event, cmrGran) => {
  let datetime = cmrGran.time_start;
  if (cmrGran.time_end) {
    datetime = `${datetime}/${cmrGran.time_end}`;
  }

  const dataLink = _.first(
    cmrGran.links.filter(l => l.rel === DATA_REL && !l.inherited)
  );
  const browseLink = _.first(
    cmrGran.links.filter(l => l.rel === BROWSE_REL)
  );
  const opendapLink = _.first(
    cmrGran.links.filter(l => l.rel === DOC_REL && !l.inherited && l.href.includes('opendap'))
  );

  const linkToAsset = (l) => ({
    name: l.title,
    href: l.href,
    type: l.type
  });

  const assets = {};
  if (dataLink) {
    assets.data = linkToAsset(dataLink);
  }
  if (browseLink) {
    assets.browse = linkToAsset(browseLink);
  }
  if (opendapLink) {
    assets.opendap = linkToAsset(opendapLink);
  }

  return {
    type: 'Feature',
    id: cmrGran.id,
    geometry: cmrSpatialToGeoJSONGeometry(cmrGran),
    links: {
      self: {
        rel: 'self',
        href: generateAppUrl(event,
          `/collections/${cmrGran.collection_concept_id}/items/${cmrGran.id}`)
      },
      parent: {
        rel: 'parent',
        href: generateAppUrl(event, `/collections/${cmrGran.collection_concept_id}`)
      },
      metadata: wfs.createLink('metadata', cmr.makeCmrSearchUrl(`/concepts/${cmrGran.id}.native`))
    },
    properties: {
      provider: cmrGran.data_center,
      // TODO this appears to be a bug in the schema. It requires additional properties to be
      // objects. How would we put another string prop in here?
      // granule_ur: cmrGran.title,
      datetime
    },
    assets
  };
};

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
  cmrCollToWFSColl,
  cmrGranToFeatureGeoJSON,
  cmrGranulesToFeatureCollection,
  parseOrdinateString,
  // For testing
  _private: {
    addPointsToBbox,
    WHOLE_WORLD_BBOX,
    cmrCollSpatialToExtents
  }
};
