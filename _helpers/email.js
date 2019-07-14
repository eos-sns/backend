const config = require('config.json');
const nodemailer = require('nodemailer');

module.exports = {
  sendEmail,
  getMessageOnStartDownload
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

function getMessageOnStartDownload(user, res) {
  return '<p>wow! </p><strong>this is strong</strong>';
}
