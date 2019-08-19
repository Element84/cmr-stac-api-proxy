const axios = require('axios');
const { makeCmrSearchUrl } = require('../../lib/cmr');

describe('cmr', () => {
  let path, params;

  beforeEach(() => {
    path = 'path/to/resource';
    params = { param: 'test' };
  });

  describe('makeCmrSearchUrl', () => {
    it('should create a url with zero params.', () => {
      expect(makeCmrSearchUrl()).toBe('https://cmr.earthdata.nasa.gov/search');
    });

    it('should create a url with path.', () => {
      expect(makeCmrSearchUrl(path)).toBe('https://cmr.earthdata.nasa.gov/search/path/to/resource');
    });

    it('should create a url based on query params', () => {
      expect(makeCmrSearchUrl(path, params)).toBe('https://cmr.earthdata.nasa.gov/search/path/to/resource?param=test');
    });
  });

  const { findCollections } = require('../../lib/cmr');

  describe('findCollections', () => {
    beforeEach(() => {
      jest.mock('axios');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return a url with granules and downloadable as true', async () => {
      expect(await findCollections()).toBeTruthy();
    });

    it('should return an axios call', async () => {
      expect(await findCollections()).toBe(axios.get('https://cmr.earthdata.nasa.gov/search/collections.json?has_granules=true&downloadable=true'));
    });
  });

  // it('works with promises', () => {
  //   expect.assertions(1);
  //   return user.getUserName(4).then(data => expect(data).toEqual('Mark'));
  // });

  // const {getCollection} = require('../../lib/cmr')

  // describe('getCollection', () => {
  //   let conceptId = 'abc123'
  //   console.log(getCollection(conceptId))
  //   // also waiting for promise to return
  //   it('should get a collection', () => {
  //     expect(getCollection(conceptId)).toEqual('abc123')
  //   })
  // })

  // const {findGranules} = require('../../lib/util')

  // describe('findGranules', () => {
  //   params

//   it('should show granules', () => {
//     findGranules(params).toBe('https://cmr.earthdata.nasa.gov/search/granules.json?param=test')
//   })
// })
});
