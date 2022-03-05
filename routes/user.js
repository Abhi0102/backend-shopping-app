const express = require("express");
const Router = express.Router();

const { signup } = require("../controllers/user");

Router.route("/signup").post(signup);

module.exports = Router;
