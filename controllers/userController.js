const crypto = require('crypto');

const User = require('../models/userModel');

const sendToken = require('../utils/jwtToken');

const sendEmail = require('../utils/sendEmail');

const dotenv = require('dotenv');

//config

dotenv.config({ path: 'config.env' });

var cloudinary = require('cloudinary').v2;

//Register a user

exports.registerUser = async (req, res, next) => {
  try {
    const myCloud = await cloudinary.uploader.upload(req.body.avatar, {
      folder: 'avatars',
      width: 150,
      crop: 'scale',
    });

    const { name, email, password } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });

    sendToken(user, 201, res);
  } catch (err) {
    return console.log('Registeruser error', err);
  }
};

//login user

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  //checking if user has given password and email both
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Please Enter Email and password' });
    }
    const user = await User.findOne({ email }).select('+password');

    //if not right user
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    sendToken(user, 200, res);
  } catch (err) {
    console.log('error', err);
  }
};

//logout user

exports.logout = async (req, res, next) => {
  localStorage.removeItem('token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

//forgot password

exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //generating reset links for mail

  const resetPasswordUrl = `${req.protocol}://${req.get(
    'host'
  )}/password/reset/${resetToken}`;

  // const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `Your password reset token is:- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then,please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `MarketCart Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ message: error });
  }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
  // creating token hash

  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    // resetPasswordToken:resetPasswordToken,
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ message: 'Reset Password Token is invalid or has been expired' });
  }

  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({ message: 'Password does not match' });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
};

// Get User Detail
exports.getUserDetails = async (req, res, next) => {
  if (req.id === null) {
    return res.status(400).json({ message: 'Login first' });
  }

  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
};

// update User password
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return res.status(400).json({ message: 'password does not match' });
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
  } catch (err) {
    return console.log('error>>>', err);
  }
};

// update User profile
exports.updateProfile = async (req, res, next) => {
  try {
    let newUserData = {
      name: req.body.name,
      email: req.body.email,
    };

    // adding cloudinary later-profile pic

    if (req.body.avatar !== '') {
      const user = await User.findById(req.user.id); //finding user

      const imageId = user.avatar.public_id;
      //after updating pic , we will have to destroy old pic.
      await cloudinary.uploader.destroy(imageId);

      const myCloud = await cloudinary.uploader.upload(req.body.avatar, {
        folder: 'avatars',
        width: 150,
        crop: 'scale',
      });

      newUserData.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  } catch (err) {
    return console.log('error>>>', err);
  }

  res.status(200).json({
    success: true,
  });
};

//get all users---admin

exports.getAllUser = async (req, res, next) => {
  let users;

  try {
    users = await User.find();
  } catch (err) {
    return console.log('error>>>>', err);
  }

  res.status(200).json({
    success: true,
    users,
  });
};

//get single users----admin

exports.getSingleUser = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.params.id);
  } catch (err) {
    console.log('error', err);
  }
  if (!user) {
    return res
      .status(400)
      .json({ message: `User does not exist with Id: ${req.params.id}` });
  }

  res.status(200).json({
    success: true,
    user,
  });
};

// update user role---admin
exports.updateUserRole = async (req, res, next) => {
  let user;
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };

    user = await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  } catch (err) {
    console.log('error', err);
  }

  if (!user) {
    return res
      .status(400)
      .json({ message: `User does not exist with Id:${req.params.id}` });
  }

  res.status(200).json({
    success: true,
  });
};

//  delete user ---admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(400)
        .json({ message: `User does not exist with Id:${req.params.id}` });
    }

    const imageId = user.avatar.public_id;

    await cloudinary.uploader.destroy(imageId);

    await user.remove();
  } catch (err) {
    return console.log('error', err);
  }
  res.status(200).json({
    success: true,
    message: 'User deleted Successfully',
  });
};
