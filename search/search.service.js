﻿const rp = require('request-promise');

module.exports = {
  searchByParams
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
