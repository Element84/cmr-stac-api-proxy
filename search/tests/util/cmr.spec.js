const sinon = require('sinon')
const {makeCmrSearchUrl} = require('../../lib/util')

// test axios calls for cmrSearch

describe ('makeCmrSearchUrl', () => {
  let path, queryParams

  beforeEach(() => {
    path = 'path/to/resource'
    queryParams = { param: 'test'}
  })

  it('should create a url based on query params', () => {
    makeCmrSearchUrl(path, queryParams).toBe('https://cmr.earthdata.nasa.gov/search/path/to/resource?param=test')
  })
})

const {findCollections} = require('../../lib/util')

describe('findCollections', () => {
  let params
  
  beforeEach(() => {
    params = {param: 'test'}
  })

  it('should show collections', () => {
    findCollections(params).toBe('https://cmr.earthdata.nasa.gov/search/collections.json?param=test')
  })
})

const {getCollection} = require('../../lib/util')

// not really sure what to test here

describe('getCollection', () => {
  let conceptId

  beforeEach(() => {
    conceptId = 'abc123'

    it('should get a collection', () => {
      getCollection(conceptId).toBe('')
    })
  })
})

const {findGranules} = require('../../lib/')

describe('findGranules', () => {
  let params

  beforeEach(() => {
    params = {param: 'test'}
  })

  it('should show granules', () => {
    findGranules(params).toBe('https://cmr.earthdata.nasa.gov/search//granules.json?param=test')
  })
})