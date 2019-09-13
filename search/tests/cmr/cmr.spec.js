const axios = require('axios');
const { makeCmrSearchUrl, cmrSearch, findCollections, findGranules, getCollection, convertParams } = require('../../lib/cmr');

describe('cmr', () => {
  let path, params, headers;

  beforeEach(() => {
    path = 'path/to/resource';
    params = { param: 'test' };
    headers = {
      'Client-Id': 'cmr-stac-api-proxy'
    };
  });

  describe('makeCmrSearchUrl', () => {
    it('should exist', () => {
      expect(makeCmrSearchUrl).toBeDefined()
    })
    it('should create a url with zero params.', () => {
      expect(makeCmrSearchUrl()).toBe('https://cmr.earthdata.nasa.gov/search');
    });

    it('should create a url with path and no query params', () => {
      expect(makeCmrSearchUrl(path)).toBe('https://cmr.earthdata.nasa.gov/search/path/to/resource');
    });

    it('should create a url with a path and query params', () => {
      expect(makeCmrSearchUrl(path, params)).toBe('https://cmr.earthdata.nasa.gov/search/path/to/resource?param=test');
    });
  });

  describe('cmrSearch', () => {
    // beforeEach(() => {
    //   axios.get = jest.fn()
    //   const url = 'https://example.com'
    // })
    
    // afterEach(() => {
    //   jest.restoreAllMocks();
    // });

    const url = 'https://example.com'
    console.log(cmrSearch(url, {params, headers}))

    it('should exist', () => {
      expect(cmrSearch).toBeDefined()
    })

    // it('should return a url with one param', () => {
    //   expect(cmrSearch(url)).toEqual({})
    // })
  })

  describe('findCollections', () => {
    beforeEach(() => {
      axios.get = jest.fn();
      const cmrResponse = { data: { feed: { entry: { test: 'value' } } } };
      axios.get.mockResolvedValue(cmrResponse);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return a url with granules and downloadable as true', async () => {
      const result = await findCollections();

      expect(axios.get.mock.calls.length).toBe(1);
      expect(axios.get.mock.calls[0][0]).toBe('https://cmr.earthdata.nasa.gov/search/collections.json');
      expect(axios.get.mock.calls[0][1]).toEqual({ params: { has_granules: true, downloadable: true }, headers: { 'Client-Id': 'cmr-stac-api-proxy' } });
      expect(result).toEqual({ test: 'value' });
    });

    it('should return a url with granues and downloadable as true as well as params', async () => {
      const result = await findCollections(params);

      expect(axios.get.mock.calls.length).toBe(1);
      expect(axios.get.mock.calls[0][0]).toBe('https://cmr.earthdata.nasa.gov/search/collections.json');
      expect(axios.get.mock.calls[0][1]).toEqual({ params: { has_granules: true, downloadable: true, param: 'test' }, headers: { 'Client-Id': 'cmr-stac-api-proxy' } });
      expect(result).toEqual({ test: 'value' });
    });
  });

  describe('findGranules', () => {
    beforeEach(() => {
      axios.get = jest.fn();
      const cmrResponse = { data: { feed: { entry: { test: 'value' } } } };
      axios.get.mockResolvedValue(cmrResponse);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return a url with /granules.json appended', async () => {
      const result = await findGranules();

      expect(axios.get.mock.calls.length).toBe(1);
      expect(axios.get.mock.calls[0][0]).toBe('https://cmr.earthdata.nasa.gov/search/granules.json');
      expect(result).toEqual({ test: 'value' });
    });

    it('should return a url with /granules.json appended and params', async () => {
      const result = await findGranules(params);

      expect(axios.get.mock.calls.length).toBe(1);
      expect(axios.get.mock.calls[0][0]).toBe('https://cmr.earthdata.nasa.gov/search/granules.json');
      expect(axios.get.mock.calls[0][1]).toEqual({ params: { param: 'test' }, headers: { 'Client-Id': 'cmr-stac-api-proxy' } });
      expect(result).toEqual({ test: 'value' });
    });
  });

  // run findCollections
  // findCollections => ${url}/collections.json?has_granules=true&downloadable=true&concept_id=10
  // getCollection => findCollections[0] || null

  describe('getCollections', () => {
    beforeEach(() => {
      axios.get = jest.fn();
      const cmrResponse = { data: { feed: { entry: { concept_id: 10 } } } };
      axios.get.mockResolvedValue(cmrResponse);
    });

    it('should return a collection', async () => {
      const conceptId = 10;
      const result = await findCollections({ concept_id: conceptId });

      console.log('result: ', result);

      expect(axios.get.mock.calls.length).toBe(1);
      expect(axios.get.mock.calls[0][0]).toBe('https://cmr.earthdata.nasa.gov/search/collections.json');
      expect(axios.get.mock.calls[0][1]).toEqual({ params: { has_granules: true, downloadable: true, concept_id: 10 }, headers: { 'Client-Id': 'cmr-stac-api-proxy' } });
      expect(result).toEqual({ concept_id: 10 });
    });

    it('should return null if there is no conceptId', async () => {
      const result = await getCollection(10);

      expect(axios.get.mock.calls.length).toBe(1);
      expect(axios.get.mock.calls[0][0]).toBe('https://cmr.earthdata.nasa.gov/search/collections.json');
      expect(result).toBe(null);
    });
  });

  describe('convertParams', () => {
    it('should create a new set of params based on a conversion Map.', () => {
      const map = { originalKey: ['key', (v) => v.toUpperCase()] };
      const original = { originalKey: 'test' };
      const converted = { key: 'TEST' };
      expect(convertParams(map, original)).toEqual(converted);
    });
  });
});
