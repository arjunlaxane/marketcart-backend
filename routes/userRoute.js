const express = require('express');

const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController');
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require('../middleware/authentication');
// const User = require('../models/userModel');
const router = express.Router();

// register route
router.route('/register').post(registerUser);

// login user
router.route('/login').post(loginUser);

// logout user
router.route('/logout').get(logout);

// forgot password

router.route('/password/forgot').post(forgotPassword);

// reset password

router.route('/password/reset/:token').put(resetPassword);

// user details

router.route('/me').get(isAuthenticatedUser, getUserDetails);

// update password

router.route('/password/update').put(isAuthenticatedUser, updatePassword);

// update profile

router.route('/me/update').put(isAuthenticatedUser, updateProfile);

// get all user---admin

router
  .route('/admin/users')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getAllUser);

// get single user-admin

router
  .route('/admin/user/:id')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

module.exports = router;
