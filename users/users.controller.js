const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const authorize = require('_helpers/authorize');
const Role = require('_helpers/role');

// routes
router.post('/authenticate', authenticate); // public
router.post('/register', register); // public
router.get('/', getAll); // public
router.get('/', authorize(Role.Admin), getAll); // admin only
router.get('/current', authorize(), getCurrent); // just authenticated users
router.get('/:id', authorize(), getById); // just authenticated users
router.put('/:id', authorize(), update); // just authenticated users
router.delete('/:id', authorize(), _delete); // just authenticated users

module.exports = router;

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function _isAuthorized(req) {
  const currentUser = req.user;
  const id = parseInt(req.params.id);

  // only allow admins to access other user records
  return !(id !== currentUser.sub && currentUser.role !== Role.Admin);
}

function getById(req, res, next) {
    if (!_isAuthorized(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
  if (!_isAuthorized(req)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  userService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
  if (!_isAuthorized(req)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}