const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const cookietoken = require("../utils/cookietoken");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

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
