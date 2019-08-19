const { addPointsToBbox } = require('../../lib/cmr_converter')._private;

describe('addPointsToBbox', () => {
  it('should add points if there is not a bbox', () => {
    // expect(addPointsToBbox(null, [175, 10, 10, 175]))
  });
});

const { WHOLE_WORLD_BBOX } = require('../../lib/cmr_converter')._private;

describe('WHOLEWORLDBBOX', () => {
  it('should equal an exact value', () => {
    // expect(WHOLE_WORLD_BBOX).toEqual([-180, 90, 180, -90]); // might need to try JSON.stringify() if this doesn't work
  });
});

const { cmrCollSpatialToExtents } = require('../../lib/cmr_converter')._private;

// need to look for polygons, points, lines, boxes, and isNull

describe('cmrCollSpatialToExtents', () => {
  const cmrColl = {
    id: 1,
    lines: true
  };
  // describe('polygons', () => {
  //   it('should return a bbox and points', () => {

  //   })
  // })
  // describe('points', () => {
  //   it('should return a bbox and points', () => {

  //   })
  // })
  // describe('lines', () => {
  //   it('should throw an error', () => {
  //       expect(cmrCollSpatialToExtents(cmrColl).toThrow(new Error))
  //   })
  // })
  // describe('boxes', () => {
  //   it('should return something', () => {

  //   })
  // })
  // describe('already has a bbox', () => {
  //   console.log(WHOLE_WORLD_BBOX);
  //   it('should should return WHOLE_WORLD_BBOX', () => {
  //     expect(cmrCollSpatialToExtents(cmrColl)).toEqual(WHOLE_WORLD_BBOX);
  //   });
  // });
});
