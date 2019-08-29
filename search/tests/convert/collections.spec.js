const { cmrGranulesToFeatureCollection } = require('../../lib/convert');

describe('cmrGranulesToFeatureCollection', () => {
  const cmrGran = [{
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
    points: ['39,77']
  }];

  const event = { headers: { Host: 'example.com' }, queryStringParameters: [] };

  it('should return a cmrGranule to a FeatureCollection', () => {
    expect(cmrGranulesToFeatureCollection(event, cmrGran)).toEqual({
      type: 'FeatureCollection',
      features: [{
        id: 1,
        geometry: { type: 'Point', coordinates: [77, 39] },
        properties: {
          provider: 'USA',
          datetime: '0/1'
        },
        type: 'Feature',
        assets: {},
        links: {
          self: {
            rel: 'self',
            href: 'http://example.com/collections/10/items/1'
          },
          parent: {
            rel: 'parent',
            href: 'http://example.com/collections/10'
          },
          metadata: {
            href: 'https://cmr.earthdata.nasa.gov/search/concepts/1.native',
            rel: 'metadata',
            type: 'application/json',
            title: undefined
          }
        }
      }],
      links: {
        self: 'http://example.com/undefined?',
        next: 'http://example.com/undefined?page_num=2'
      }
    });
  });
});
