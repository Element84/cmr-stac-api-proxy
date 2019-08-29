const boundingBox = require('./bounding-box');
const collections = require('./collections');
const { inspect } = require('util');

console.log(inspect(boundingBox));
module.exports = Object.assign({}, boundingBox, collections);
