const express = require("express");
const Router = express.Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  forgotPasswordConfirm,
  getUserDetail,
  changePassword,
  updateUserDetails,
  adminAllUsers,
} = require("../controllers/user");
const { isLoggedIn, customRole } = require("../middlewares/user");

Router.route("/signup").post(signup);
Router.route("/login").post(login);
Router.route("/logout").get(logout);
Router.route("/forgotpassword").post(forgotPassword);
Router.route("/password/reset/:token").post(forgotPasswordConfirm);
Router.route("/password/update").post(isLoggedIn, changePassword);
Router.route("/userDashboard").get(isLoggedIn, getUserDetail);
Router.route("/userDashboard/update").post(isLoggedIn, updateUserDetails);

// Admin Routes
Router.route("/admin/users").get(
  isLoggedIn,
  customRole("admin"),
  adminAllUsers
);

module.exports = Router;
