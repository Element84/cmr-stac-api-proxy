const _ = require('lodash');
const { parseOrdinateString, pointStringToPoints, cmrCollSpatialToExtents } = require('../convert');
const { wfs, generateAppUrl, extractParam, generateSelfUrl } = require('../util');
const cmr = require('./cmr');

// move to collection_converter

// TODO remove page_num params from these

// Move to collection_converter

// Move to granule_to_item
const cmrPolygonToGeoJsonPolygon = (polygon) => {
  const rings = polygon.map((ringStr) => pointStringToPoints(ringStr).map(([lat, lon]) => [lon, lat]));
  return {
    type: 'Polygon',
    coordinates: rings
  };
};

// Move to granule_to_item
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

// Move to granule_to_item
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

// Move to granule_to_item
const DATA_REL = 'http://esipfed.org/ns/fedsearch/1.1/data#';
const BROWSE_REL = 'http://esipfed.org/ns/fedsearch/1.1/browse#';
const DOC_REL = 'http://esipfed.org/ns/fedsearch/1.1/documentation#';

// Move to granule_to_item
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
  cmrGranToFeatureGeoJSON,
  cmrGranulesToFeatureCollection,
  // For testing
  _private: {
    cmrCollSpatialToExtents
  }
};
