const express = require("express");
const Router = express.Router();

const { signup, login, logout } = require("../controllers/user");

Router.route("/signup").post(signup);
Router.route("/login").post(login);
Router.route("/logout").get(logout);

module.exports = Router;
