const { 
  cmrCollSpatialToExtents,
  stacSearchWithCurrentParams,
  cmrGranulesSearchWithCurrentParams,
  cmrCollToWFSColl
} = require('../../lib/convert/collections');

describe('collections', () => {
  describe('cmrCollSpatialToExtents', () => {
    // four scenarios need to be tested. The cmrColl object having either polygons, 
    // points, lines, boxes, or nothing.
    let cmrCollection;

    it('should return a bounding box from given polygon', () => {
      cmrCollection = {
        polygons: [['30 -10 70 33 -45 66']]
      };
      expect(cmrCollSpatialToExtents(cmrCollection)).toEqual([-10, 70, 66, -45]);
    });

    it('should return a bounding box from given points', () => {
      cmrCollection = {
        points: ['30 -10', '70 33', '-45 66']
      };
      expect(cmrCollSpatialToExtents(cmrCollection)).toEqual([-10, 70, 66, -45]);
    });

    it('should throw an error if given lines', () => {
      cmrCollection = {
        id: 'sampleCollection',
        lines: [28.2, 44, -44, 109.3]
      }
      expect(() => { cmrCollSpatialToExtents(cmrCollection); }).toThrow(Error);
    });

    it('should return a bounding box from provided coordinates [west north east south]', () => {
      cmrCollection = {
        boxes: ['-23.4 -74.6 54.9 33.3']
      };
      expect(cmrCollSpatialToExtents(cmrCollection)).toEqual([-23.4, -74.6, 54.9, 33.3]);
    });
  });
});
