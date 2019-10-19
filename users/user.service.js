const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../_helpers/db');
const password = require('secure-random-password');
const {
  sendEmail, getMessageOnResetPassword, getMessageOnAccountActivation,
  getMessageOnAccountActivationRequest
} = require("../_helpers/email");

const User = db.User;

module.exports = {
  authenticate,
  getAll,
  getById,
  getByReq,
  create,
  update,
  delete: _delete,
  resetPassword,
  getIdCurrentReq,
  getIdReq
};

function getRandomPassword() {
  return password.randomPassword({
    length: 32,
    characters: password.lower + password.upper + password.digits
  });
}

async function authenticate({username, password}) {
  const user = await User.findOne({username});
  if (user && bcrypt.compareSync(password, user.hash)) {
    const {...userWithoutHash} = user.toObject();
    const token = jwt.sign({sub: user.id}, config.secret);
    return {
      ...userWithoutHash,
      token
    };
  }
}

async function getAll() {
  return await User.find().select('-hash');
}

function getIdReq(req) {
  return req.params.id;
}

function getIdCurrentReq(req) {
  return req.user.sub;
}

async function getByReq(req) {
  const _id = getIdReq(req);
  return getById(_id);
}

async function getById(id) {
  return await User.findById(id).select('-hash');
}

async function askAdminToCompleteActivation(user) {
  const authorizationLink = config.admin.authLink + user._id;
  sendEmail(
    config.admin.email,
    config.emails.titles.accountActivationRequest,
    getMessageOnAccountActivationRequest(user, authorizationLink)
  )
}

async function create(userParam) {
  // validate
  if (await User.findOne({username: userParam.username})) {
    throw 'Username "' + userParam.username + '" is already taken';
  }

  if (await User.findOne({email: userParam.email})) {
    throw 'Email "' + userParam.email + '" is already taken';
  }

  const user = new User(userParam);

  // hash password
  const newPassword = getRandomPassword();
  user.hash = bcrypt.hashSync(newPassword, 10);

  // save user
  return user.save().then(
    () => (
      User.findOne({'email': user.email})
        .then((x) => askAdminToCompleteActivation(x))
    )
  ).catch((err) => console.log(err));  // report error
}

async function update(id, userParam) {
  const user = await User.findById(id);

  // validate
  if (!user) throw 'User not found';

  if (user.username !== userParam.username && await User.findOne({username: userParam.username})) {
    throw 'Username "' + userParam.username + '" is already taken';
  }

  if (user.email !== userParam.email && await User.findOne({email: userParam.email})) {
    throw 'Email "' + userParam.email + '" is already taken';
  }

  // user has been just authorized
  if (!user.authorized && userParam.authorized) {
    const newPassword = getRandomPassword();  // create a new password
    userParam.password = newPassword;
    await notifyUserOfAuthorization(user._id, newPassword);
  }

  // hash password if it was entered
  if (userParam.password) {
    userParam.hash = bcrypt.hashSync(userParam.password, 10);
  }

  // copy userParam properties to user
  Object.assign(user, userParam);

  await user.save();
}

async function _delete(id) {
  await User.findByIdAndRemove(id);
}

/**
 * Reset by email
 */
async function resetPassword(userEmail) {
  const user = await User.findOne({email: userEmail});  // the first found
  if (user) {
    const newPassword = getRandomPassword();

    update(
      user._id, {'password': newPassword}
    )
      .then(() => sendEmail(
        userEmail,
        config.emails.titles.passwordReset,
        getMessageOnResetPassword(user, newPassword, config.frontend.loginUrl, config.frontend.userUrl, config.admin.email)
      ))
      .catch(err => console.err(err));  // todo report error
  }
}

async function notifyUserOfAuthorization(userId, newPassword) {
  const user = await User.findById(userId);
  sendEmail(
    user.email,
    config.emails.titles.accountActivation,
    getMessageOnAccountActivation(user, newPassword, config.frontend.loginUrl, config.frontend.userUrl, config.admin.email)
  )
}