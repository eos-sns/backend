﻿require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('./_helpers/jwt');
const errorHandler = require('./_helpers/error-handler');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.use(jwt()); // use JWT auth to secure the api
app.use('/users', require('./users/users.controller')); // users api routes
app.use('/search', require('./search/search.controller')); // search api routes
app.use(errorHandler); // global error handler

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, function () {
  console.log('Server listening on port ' + port);
});
