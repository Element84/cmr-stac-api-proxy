const sinon = require('sinon');
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
  });

  const { findCollections } = require('../../lib/cmr');

  describe('findCollections', () => {
    params
    headers
    console.log('these are the params', params)
    console.log('findCollections', findCollections())
    it('should return a url with granules and downloadable as true', async () => {
      expect(await findCollections()).toContain({})
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
