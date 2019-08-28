const { chunk } = require('lodash');

const addPointsToBbox = (bbox, points) => {
  let w; let n; let e; let s;
  if (bbox) {
    [w, n, e, s] = bbox;
  }
  points.forEach(([lat, lon]) => {
    // if bbox === true compare variable values with points values to cover largest area
    if (w) {
      w = Math.min(w, lon);
      n = Math.max(n, lat);
      e = Math.max(e, lon);
      s = Math.min(s, lat);
    } else { // if bbox === false take values from points
      [w, n, e, s] = [lon, lat, lon, lat];
    }
  });
  return [w, n, e, s];
  // addPointsToBbox ([1, 2, 3, 4], [[5, 6], [7, 8]]) => [1, 7, 8, 4]
};

const mergeBoxes = (box1, box2) => {
  if (box1 === null) {
    return box2;
  }
  return [
    Math.min(box1[0], box2[0]),
    Math.max(box1[1], box2[1]),
    Math.max(box1[2], box2[2]),
    Math.min(box1[3], box2[3])
  ];
};

const parseOrdinateString = (numStr) => numStr.split(/\s|,/).map(parseFloat);

const pointStringToPoints = (pointStr) => chunk(parseOrdinateString(pointStr), 2);

module.exports = {
  addPointsToBbox,
  mergeBoxes,
  parseOrdinateString,
  pointStringToPoints
};
