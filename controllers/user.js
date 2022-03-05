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
