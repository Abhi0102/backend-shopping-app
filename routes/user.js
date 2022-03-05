const express = require("express");
const Router = express.Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  forgotPasswordConfirm,
} = require("../controllers/user");

Router.route("/signup").post(signup);
Router.route("/login").post(login);
Router.route("/logout").get(logout);
Router.route("/forgotpassword").post(forgotPassword);
Router.route("/password/reset/:token").post(forgotPasswordConfirm);

module.exports = Router;
