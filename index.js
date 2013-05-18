module.exports = process.env.ANALYSES_COV
  ? require('./lib-cov')
  : require('./lib');
