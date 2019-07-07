const expressJwt = require('express-jwt');
const { secret } = require('config.json');
const db = require('_helpers/db');
const User = db.User;

module.exports = authorize;

function authorize(roles = []) {
    // roles param can be a single role string (e.g. Role.User or 'User') 
    // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authenticate JWT token and attach user to request object (req.user)
        expressJwt({ secret }),

        // authorize based on user role
      async (req, res, next) => {
        const _id = req.user.sub;
        const user = await User.findById(_id);  // find in db
        const inValidRole = roles.length && !roles.includes(user.role);
        if (inValidRole || !user) {
                // user's role is not authorized
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // authentication and authorization successful
            next();
        }
    ];
}