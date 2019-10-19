const rp = require('request-promise');

module.exports = {
  searchByParams,
  estimateByParams
};

/**
 * @param params dictionary
 * @returns {Promise<{status: string}[]>}
 */
function searchByParams(params) {
  return rp.post('http://localhost:9900', {
    json: params
  });
}

function estimateByParams(params) {
  return Promise.resolve({
    nSimulations: Math.random(),
    mbSize: Math.random(),
  });
  /* todo return rp.get('http://localhost:9900', {
    json: params
  }); */
}