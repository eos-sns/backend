const express = require('express');
const router = express.Router();
const authorize = require('_helpers/authorize');
const {searchByParams} = require('./search.service');

// routes
// todo grant
router.post('/', authorize(), search); // just authenticated users

module.exports = router;

function search(req, res, next) {
  searchByParams(req.body)
    .then(response => res.json(response))
    .catch(err => next(err));
}
