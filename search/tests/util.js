
const hasOwnProperty = Object.prototype.hasOwnProperty;

function mockFunction (obj, name) {
  if (!hasOwnProperty.call(obj, name)) return obj;

  obj[`__orig__${name}`] = obj[name];
  obj[name] = jest.fn();

  return obj;
}

function revertFunction (obj, name) {
  if (!hasOwnProperty.call(obj, `__orig__${name}`)) return obj;

  obj[name] = obj[`__orig__${name}`];
  delete obj[`__orig__${name}`];

  return obj;
}

module.exports = {
  mockFunction,
  revertFunction
};
