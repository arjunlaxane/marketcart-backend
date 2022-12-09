//creating token and saving in cookie
require('dotenv').config({ path: 'config.env' });

const sendToken = (user, statusCode, res) => {
  let token = user.getJWTToken();
  // token = localStorage.getItem('token');

  res.status(statusCode).json({
    success: true,
    user,
    token,
  });
};

module.exports = sendToken;
