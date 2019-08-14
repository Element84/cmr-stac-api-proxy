const {addPointsToBbox} = require('../../lib/util')

describe('addPointsToBbox', () => {
  it('should add points if there is a bbox', () => {
    addPointsToBbox([-180, 90, 180, -90], [180, 90])
  })
  it('should add points if there is not a bbox', () => {
    addPointsToBbox(null, [175, 10])
  })
})

const {WHOLE_WORLD_BBOX} = require('../../lib/util')

describe('WHOLEWORLDBBOX', () => {
  it('should equal an exact value', () => {
    expect(WHOLE_WORLD_BBOX).toEqual([-180, 90, 180, -90]) // might need to try JSON.stringify() if this doesn't work
  })
})

const {cmrCollSpatialToExtents} = require('../../lib/util')

// need to look for polygons, points, lines, boxes, and isNull

describe('cmrCollSpatialToExtents', () => {
  describe('polygons', () => {
    it('should return a bbox and points', () => {

    })
  })
  describe('points', () => {
    it('should return a bbox and points', () => {

    })
  })
  describe('lines', () => {
    it('should throw an error', () => {

    })
  })
  describe('boxes', () => {
    it('should return something', () => {

    })
  })
  describe('already has a bbox', () => {
    it('should should return WHOLE_WORLD_BBOX', () => {
      expect(bbox).toEqual(WHOLE_WORLD_BBOX)
    })
  })

})