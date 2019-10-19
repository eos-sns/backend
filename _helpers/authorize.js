const expressJwt = require('express-jwt');
const {secret} = require('config.json');
const {getCurrentUserReq} = require('../users/user.service');
const UNAUTHORIZED_MSG = {message: 'Unauthorized'};

module.exports = authorize;


function isUnauthorized(user, roles) {
  return roles.length && !roles.includes(user.role);
}

function authorize(roles = []) {
  // roles param can be a single role string (e.g. Role.User or 'User')
  // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    // authenticate JWT token and attach user to request object
    expressJwt({secret}),

    // authorize based on user role
    async (req, res, next) => {
      getCurrentUserReq(req)
        .then(user => {
          const inValidRole = isUnauthorized(user, roles);
          if (inValidRole || !user) {
            return res.status(401).json(UNAUTHORIZED_MSG);
          }

          // authentication and authorization successful
          next();
        })
        .catch(err => next(err));
    }
  ];
}