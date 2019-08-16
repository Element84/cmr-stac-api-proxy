const axios = require('axios')
const { makeCmrSearchUrl } = require('../../lib/cmr');

// test axios calls for cmrSearch

const path = 'path/to/resource';
const params = { param: 'test' };
const headers = {
  'Client-Id': 'cmr-stac-api-proxy'
};

describe('cmr', () => {
  describe('makeCmrSearchUrl', () => {
    path;
    queryParams = { ...params };

    it('should create a url based on query params', () => {
      expect(makeCmrSearchUrl(path, queryParams)).toBe('https://cmr.earthdata.nasa.gov/search/path/to/resource?param=test');
    });
    // test for no path or query
    // test for a path but no query
  });

  const { findCollections } = require('../../lib/cmr');

  describe('findCollections', () => {
    params
    headers
    
    beforeEach(() => {
      jest.mock('axios');
    }) 

    afterEach(() => {
      jest.restoreAllMocks();
    })

    console.log('findCollections', findCollections())

    it('should return a url with granules and downloadable as true', async () => {
      expect(await findCollections()).toBeTruthy()
    })

    it('should return an axios call', async () => {
      expect( await findCollections()).toBe(axios.get('https://cmr.earthdata.nasa.gov/search/collections.json?has_granules=true&downloadable=true'))
    })

    // waiting for promise to be resolved?
    // it('should show collections', async () => {
    //   expect(await findCollections(params)).toBe('https://cmr.earthdata.nasa.gov/search/collections.json?param=test')
    // })
  })

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
