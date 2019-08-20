const {
  cmrCollToWFSColl,
  cmrGranToFeatureGeoJSON,
  cmrGranulesToFeatureCollection,
  parseOrdinateString
} = require('../../lib/cmr_converter');

describe('cmrCollToWFSCol', () => {
  const cmrColl = {
    id: 'id',
    dataset_id: 'datasetId',
    summary: 'summary',
    time_start: 0,
    time_end: 1
  };

  const event = { headers: { Host: 'example.com' }, queryStringParameters: [] };

  it('should return a WFS Collection from a CMR collection.', () => {
    expect(cmrCollToWFSColl(event, cmrColl)).toEqual({
      description: 'summary',
      extent: {
        crs: 'http://www.opengis.net/def/crs/OGC/1.3/CRS84',
        spatial: [
          -180,
          90,
          180,
          -90
        ],
        temporal: [
          0,
          1
        ],
        trs: 'http://www.opengis.net/def/uom/ISO-8601/0/Gregorian'
      },
      links: [
        {
          href: 'http://example.com/collections/id',
          rel: 'self',
          title: 'Info about this collection',
          type: 'application/json'
        }, {
          href: 'http://example.com/search/stac?collectionId=id',
          rel: 'stac',
          title: 'STAC Search this collection',
          type: 'application/json'
        }, {
          href: 'https://cmr.earthdata.nasa.gov/search/granules.json?collection_concept_id=id',
          rel: 'cmr',
          title: 'CMR Search this collection',
          type: 'application/json'
        }, {
          href: 'http://example.com/collections/id/items',
          rel: 'items',
          title: 'Granules in this collection',
          type: 'application/json'
        }, {
          href: 'https://cmr.earthdata.nasa.gov/search/concepts/id.html',
          rel: 'overview',
          title: 'HTML metadata for collection',
          type: 'application/json'
        }, {
          href: 'https://cmr.earthdata.nasa.gov/search/concepts/id.native',
          rel: 'metadata',
          title: 'Native metadata for collection',
          type: 'application/json'
        }, {
          href: 'https://cmr.earthdata.nasa.gov/search/concepts/id.umm_json',
          rel: 'metadata',
          title: 'JSON metadata for collection',
          type: 'application/json'
        }
      ],
      name: 'id',
      title: 'datasetId' });
  });
});

describe('cmrGranToFeatureGeoJSON', () => {
  const cmrGran = {
    id: 1,
    collection_concept_id: 10,
    dataset_id: 'datasetId',
    summary: 'summary',
    time_start: 0,
    time_end: 1,
    links: [
      {
        href: 'http://example.com/collections/id',
        rel: 'self',
        title: 'Info about this collection',
        type: 'application/json'
      }
    ],
    data_center: 'USA',
    points: ['39, 77']
  }

  const event = { headers: { Host: 'example.com' }, queryStringParameters: [] };

  it('should return a FeatureGeoJSON from a cmrGran', () => {
    expect(cmrGranToFeatureGeoJSON(event, cmrGran)).toEqual({
      type: 'Feature',
      id: 1,
      geometry: { type: 'Point', coordinates: [39, 77] },
      links: {
        self: {
          rel: 'self',
          href: 'http://example.com/collections/10/items/1 '
        },
        parent: {
          rel: 'parent',
          href: 'http://example.com/collections/10'
        },
        metadata: {
          href: 'http://example.com/concepts/1.native',
          rel: 'metadata',
          type: 'application/json',
          title: ''
        },
        properties: {
          provider: 'USA',
          datetime: '0/1'
        },
        assets: {
          name: 'Info about this collection',
          href: 'http://example.com/collections/id',
          type: 'application/json' 
        }
      }
    })
  })
});

describe.skip('cmrGranulesToFeatureCollection', () => {
});

describe('parseOrdinateString', () => {
  it('should take a string of numbers separated by `,` or ` ` and return array of floats.', () => {
    expect(parseOrdinateString('1.1 2 4.2')).toEqual([1.1, 2, 4.2]);
    expect(parseOrdinateString('1.1,2,4.2')).toEqual([1.1, 2, 4.2]);
    expect(parseOrdinateString('1.1 2,4.2')).toEqual([1.1, 2, 4.2]);
  });

  it('should ignore separated non-number string tokens.', () => {
    expect(parseOrdinateString('1,2.1,a')).toEqual([1, 2.1, NaN]);
  });
});
