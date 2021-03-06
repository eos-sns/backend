const config = require('../config.json');
const nodemailer = require('nodemailer');
const util = require('util');

module.exports = {
  sendEmail,
  getMessageOnResetPassword,
  getMessageOnAccountActivation,
  getMessageOnAccountActivationRequest
};

function _getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.user,
      pass: config.email.pass
    }
  });
}

function sendEmail(to, subject, htmlMsg) {
  const transporter = _getTransporter();
  const mailOptions = {
    from: config.email.user, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: '<p>' + htmlMsg + '</p>' // plain text body
  };

  return transporter.sendMail(mailOptions);
}

function getSignature() {
  return '</br></br></br></br>---</br></br></br></br>EOS developers'
}

function getMessageOnResetPassword(user, newPassword, loginLink, editPasswordLink, reportEmail) {
  return util.format(
    '<p>Hi! %s %s,</br></br></br></br>' +
    'this is your new password: <strong>%s</strong>.</br></br></br></br>' +
    'Login <a href="%s">here</a> and change it <a href="%s">here</a>.</br></br></br></br>' +
    'If you haven\'t asked for a password change, please report it to <a href="mailto:%s">%s</a></br></br></br></br>' +
    '%s' +
    '</p>',
    user.firstName, user.lastName, newPassword, loginLink, editPasswordLink, reportEmail, reportEmail, getSignature()
  );
}

function getMessageOnAccountActivationRequest(user, authorizationLink) {
  return util.format(
    '<p>Dear admin,</br></br></br></br>' +
    '%s %s (%s) has requested account activation. Follow <a href="%s">this link</a> to grant authorization.' +
    '%s</p>',
    user.firstName, user.lastName, user.email, authorizationLink, getSignature()
  );
}

function getMessageOnAccountActivation(user, newPassword, loginLink, editPasswordLink, reportEmail) {
  return util.format(
    '<p>Dear %s %s,</br></br></br></br>' +
    'your account has been activated! This is your new password: <strong>%s</strong>.</br></br></br></br>' +
    'Login <a href="%s">here</a> and change it <a href="%s">here</a>.</br></br></br></br>' +
    'If you haven\'t asked for a account activation, please report it to <a href="mailto:%s">%s</a></br></br></br></br>' +
    '%s' +
    '</p>',
    user.firstName, user.lastName, newPassword, loginLink, editPasswordLink, reportEmail, reportEmail, getSignature()
  );
}
