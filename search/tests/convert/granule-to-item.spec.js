const {
  cmrPolygonToGeoJsonPolygon,
  cmrBoxToGeoJsonPolygon,
  cmrSpatialToGeoJSONGeometry,
  cmrGranToFeatureGeoJSON,
  cmrGranulesToFeatureCollection
} = require('../../lib/convert');

describe('granuleToItem', () => {
  describe('cmrPolygonToGeoJsonPolygon', () => {
    it('should return an array of coordinates for a GeoJson Polygon given one ring', () => {
      const polygon = ['10,10,30,10,30,20,10,20,10,10'];
      console.log(cmrPolygonToGeoJsonPolygon(polygon));
      expect(cmrPolygonToGeoJsonPolygon(polygon)).toEqual({
        // 'coordinates': [ [[10, 10], [30, 10], [30, 20], [10, 20], [10, 10]] ],
        coordinates: [[[30, 10], [10, 10]]],
        type: 'Polygon'
      });
    });

    it.skip('should return an array of coordinates for a GeoJson Polygon given multiple rings', () => {
      const polygon = ['10,10,30,10,30,20,10,20,10,10', '10,10,30,10,30,20,10,20,10,10'];
      expect(cmrPolygonToGeoJsonPolygon(polygon)).toEqual({
        coordinates: [[[10, 10], [30, 10], [30, 20], [10, 20], [10, 10]], [[10, 10], [30, 10], [30, 20], [10, 20], [10, 10]]],
        type: 'Polygon'
      });
    });
  });

  describe('cmrBoxToGeoJsonPolygon', () => {
    it('turn a CMR bounding box into a GeoJSON Polygon', () => {
      const cmrBox = '33,-56,27.2,80'; // s, w, n, e
      expect(cmrBoxToGeoJsonPolygon(cmrBox)).toEqual({
        type: 'Polygon',
        coordinates: [[
          [-56, 33],
          [80, 33],
          [80, 27.2],
          [-56, 27.2],
          [-56, 33]
        ]]
      });
    });
  });

  describe('cmrSpatialToGeoJSONGeometry', () => {
    // geometry.points, polygons, boxes, geometry.length===0, geometry.length==1
    let cmrSpatial;

    it('should return a single GeoJSON geometry for given one point', () => {
      cmrSpatial = {
        points: ['12,23']
      };
      console.log(cmrSpatialToGeoJSONGeometry(cmrSpatial));
      expect(cmrSpatialToGeoJSONGeometry(cmrSpatial)).toEqual({ coordinates: [23, 12], type: 'Point' });
    });

    it.skip('should return a single GeoJSON geometry for a given polygon', () => {
      cmrSpatial = {
        polygons: ['12,34,56,78']
      };

      expect(cmrSpatialToGeoJSONGeometry(cmrSpatial)).toEqual({
        coordinates: [[[12, 34], [56, 78]]],
        type: 'Polygon'
      });
    });

    it('should return an error if their is no geometry', () => {
      cmrSpatial = {
        points: [],
        boxes: [],
        polygons: []
      };
      expect(() => cmrSpatialToGeoJSONGeometry(cmrSpatial)).toThrow(Error);
    });
  });
});
