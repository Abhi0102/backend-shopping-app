const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const cookietoken = require("../utils/cookietoken");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const emailer = require("../utils/emailer");
const crypto = require("crypto");

exports.signup = BigPromise(async (req, res, next) => {
  //
  const { name, email, password } = req.body;

  if (!email || !name || !password || !req.files) {
    return next(new Error("Name, email, photo & password are required."));
  }
  let file = req.files.photo;
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 150,
    crop: "scale",
  });
  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  cookietoken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new Error("Please provide email and password"));
  }

  // Check User in DB

  const user = await User.findOne({ email }).select("+password");

  // If User not found

  if (!user) {
    return next(new Error("User not register."));
  }

  // Compare Password

  const isPasswordValid = await user.isValidPassword(password);

  // If Passoword doesn't match

  if (!isPasswordValid) {
    return next(new Error("Password is not correct."));
  }

  // If Password is correct

  cookietoken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie(process.env.COOKIE_TOKEN, null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Successfully Logged out",
  });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new Error("User Doesn't exist"));
  }

  const forgotToken = user.forgotPassword();

  await user.save({ validateBeforeSave: false });

  const forgotUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${forgotToken}`;

  const message = `Paste this link in URL \n\n ${forgotUrl}`;

  try {
    await emailer({
      toEmail: user.email,
      subject: "Password Reset Email | Shopping App",
      message,
    });

    res.status(200).json({ success: true, message: "email sent successfully" });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new Error(error.message));
  }
});

exports.forgotPasswordConfirm = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encryptToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    encryptToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new Error("Token is Invalid or Expired."));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new Error("Password and confirmed Password does not match."));
  }
  user.password = req.body.password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();
  cookietoken(user, res);
});

exports.getUserDetail = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select("+password");

  const isValidPassword = await user.isValidPassword(req.body.oldPassword);

  if (!isValidPassword) {
    return next(new Error("Old Password does not matches."));
  }

  user.password = req.body.newPassword;
  await user.save();

  cookietoken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  const newData = { name: req.body.name, email: req.body.email };
  if (req.files) {
    const user = await User.findById(req.user.id);

    const img_id = user.photo.id;

    // Delete Cloudinary Photo
    const resp = await cloudinary.uploader.destroy(img_id);

    const result = await cloudinary.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    );

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }
  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true, user });
});

exports.adminAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({ success: true, users });
});

exports.adminSingleUsers = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new Error("No User Found"));
  }

  res.status(200).json({ success: true, user });
});

exports.adminUpdateUserDetails = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true, user });
});

exports.adminDeleteUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new Error("No User Found"));
  }

  const img_id = user.photo.id;

  await cloudinary.uploader.destroy(img_id);

  await user.remove();

  res.status(200).json({ success: true });
});
