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

// admin only
router.get('/', authorize(Role.Admin), getAll);
router.delete('/:id', authorize(Role.Admin), _delete);

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
  userService.getCurrentUserReq(req)
    .then((currentUser) => {
      const otherUserId = userService.getIdReq(req);
      const currentUserIsAdmin = currentUser.role === Role.Admin;
      const sameUsers = (currentUser._id === otherUserId);

      return (sameUsers || currentUserIsAdmin);
    })
    .catch(() => (false))  // todo report
}

function getById(req, res, next) {
  userService.getByReq(req)
    .then(user => user ? res.json(user) : res.sendStatus(404))
    .catch(err => next(err));
}

function update(req, res, next) {
  _isAuthorized(req)
    .then(() => {
      const _userIdToEdit = req.params.id;
      userService.update(_userIdToEdit, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
    })
    .catch(() => {
      res.status(401).json({message: 'Unauthorized'})
    });
}

function _delete(req, res, next) {
  !_isAuthorized(req)
    .then(() => {
      userService.delete(userService.getIdReq(req))
        .then(() => res.json({}))
        .catch(err => next(err))
    })
    .catch(() => {
      res.status(401).json({message: 'Unauthorized'})
    });
}