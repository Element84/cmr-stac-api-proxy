const boundingBox = require('./bounding-box');
const collections = require('./collections');
const granuleToItem = require('./granule-to-item');

// module.exports = Object.assign({}, boundingBox, collections);
module.exports = {
  ...boundingBox,
  ...collections,
  ...granuleToItem
};
