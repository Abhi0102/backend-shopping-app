const express = require("express");
const Router = express.Router();

const { testProduct } = require("../controllers/product");
const { isLoggedIn, customRole } = require("../middlewares/user");

Router.route("/product").get(testProduct);

module.exports = Router;
