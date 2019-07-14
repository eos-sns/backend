const express = require('express');
const router = express.Router();
const authorize = require('_helpers/authorize');
const {searchByParams} = require('./search.service');
const {getByReq, update} = require('../users/user.service');
const {sendEmail, getMessageOnStartDownload} = require("../_helpers/email");

// routes
// todo grant
router.post('/', authorize(), search); // just authenticated users

module.exports = router;

function getUserEmail(req) {
  return new Promise(function (resolve, reject) {
    getByReq(req)
      .then(user => {
        resolve(user["email"]);
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
      }); // todo update mbDownloaded

      const msg = getMessageOnStartDownload(user, downloadResponse);
      sendEmail(user.email, msg);
    })
    .catch(err => next(err));
}

function search(req, res, next) {
  let searchData = req.body;

  getUserEmail(req).then(
    email => {
      searchData['user'] = {
        'email': email
      }; // add email to data

      searchByParams(searchData)
        .then(response => {
          onDownloadData(req, response, next);
          response['email'] = email;  // return email
          res.json(response);
        })
        .catch(err => next(err));
    },
    err => next(err)
  )
}
