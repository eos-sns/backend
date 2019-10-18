const express = require('express');
const router = express.Router();
const authorize = require('_helpers/authorize');
const {searchByParams} = require('./search.service');
const {getByReq, update} = require('../users/user.service');

// routes

// just authenticated users
router.post('/', authorize(), search);

module.exports = router;

function getUserData(req) {
  return new Promise(function (resolve, reject) {
    getByReq(req)
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
      const numDownloads = user.numDownloads;
      update(user._id, {
        numDownloads: numDownloads + 1
      }); // todo update mbDownloaded. check if max qty have been overcome
    })
    .catch(err => next(err));
}

function search(req, res, next) {
  let searchData = req.body;

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
