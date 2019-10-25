const express = require('express');
const router = express.Router();
const authorize = require('../_helpers/authorize');
const {searchByParams, estimateByParams} = require('./search.service');
const {getByReq, getCurrentUserReq, update} = require('../users/user.service');

// routes

// just authenticated users
router.post('/', authorize(), search);
router.put('/', authorize(), estimate);


module.exports = router;

function getUserData(req) {
  return new Promise(function (resolve, reject) {
    getCurrentUserReq(req)
      .then(user => {
        const data = {
          "email": user["email"],
          "name": user["firstName"] + " " + user["lastName"]
        };
        resolve(data);
      })
      .catch(err => reject(err));
  });
}

function onDownloadData(req, downloadResponse, next) {
  getByReq(req)
    .then(user => {
      // todo update mbDownloaded. check if max qty have been overcome
    })
    .catch(err => next(err));
}

function search(req, res, next) {
  const searchData = req.body;

  getUserData(req).then(
    data => {
      searchData['user'] = {
        'email': data['email'],
        'name': data['name']
      }; // add email to data

      searchByParams(searchData)
        .then(response => {
          onDownloadData(req, response, next);
          response['email'] = data['email'];  // return email
          res.json(response);
        })
        .catch(err => next(err));
    },
    err => {
      next(err);
    }
  )
}

function estimate(req, res, next) {
  const searchData = req.body;
  estimateByParams(searchData)
    .then(response => {
      res.json(response);
    })
    .catch(err => next(err));
}
