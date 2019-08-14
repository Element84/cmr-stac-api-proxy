const {addPointsToBbox} = require('../../lib/util')

describe('addPointsToBbox', () => {
  it('should add coordinates to a box', () => {
    addPointsToBbox([], [-180, 90, 180, -90])
  })
})


const {WHOLE_WORLD_BBOX} = require('../../lib/util')
const {cmrCollSpatialToExtents} = require('../../lib/util')

