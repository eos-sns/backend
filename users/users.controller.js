const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const authorize = require('../_helpers/authorize');
const Role = require('../_helpers/role');

// routes

// public
router.post('/authenticate', authenticate);
router.post('/register', register);
router.post('/resetPassword', resetPassword);

// just authenticated users
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), update);
router.delete('/:id', authorize(), _delete);

// admin only
router.get('/', authorize(Role.Admin), getAll);

module.exports = router;

function authenticate(req, res, next) {
  userService.authenticate(req.body)
    .then(user => user ? res.json(user) : res.status(400).json({message: 'Username or password is incorrect'}))
    .catch(err => next(err));
}

function register(req, res, next) {
  userService.create(req.body)
    .then(() => res.json({}))
    .catch(err => next(err));
}

function resetPassword(req, res, next) {
  userService.resetPassword(req.body['email'])
    .then(() => res.json({}))
    .catch(err => next(err));
}

function getAll(req, res, next) {
  userService.getAll()
    .then(users => res.json(users))
    .catch(err => next(err));
}

function getCurrent(req, res, next) {
  userService.getByReq(req)
    .then(user => user ? res.json(user) : res.sendStatus(404))
    .catch(err => next(err));
}

/**
 * Checks iff current user can see other users data. This should be true
 * when current user is Admin or the current user is the other user. Should
 * be false in all other cases.
 */
async function _isAuthorized(req) {
  const currentUser = userService.getByReq(req);  // find in db
  const otherUserId = parseInt(req.params.id);

  const currentUserIsAdmin = currentUser.role === Role.Admin;
  const sameUsers = (currentUser._id === otherUserId);

  return (sameUsers || currentUserIsAdmin);
}

function getById(req, res, next) {
  userService.getByReq(req)
    .then(user => user ? res.json(user) : res.sendStatus(404))
    .catch(err => next(err));
}

function update(req, res, next) {
  if (!_isAuthorized(req)) {
    return res.status(401).json({message: 'Unauthorized'});
  }

  userService.update(req.params.id, req.body)
    .then(() => res.json({}))
    .catch(err => next(err));
}

function _delete(req, res, next) {
  if (!_isAuthorized(req)) {
    return res.status(401).json({message: 'Unauthorized'});
  }

  userService.delete(req.params.id)
    .then(() => res.json({}))
    .catch(err => next(err));
}