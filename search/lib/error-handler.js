const { get } = require('lodash');

function errorHandler (error, req, res, next) {
  console.log(error);
  if (get(error, 'response.data.errors')) {
    res.status(400).json(error.response.data.errors);
  } else {
    res.status(500).send('Internal server error');
  }
  next();
}

module.exports = {
  errorHandler
};
