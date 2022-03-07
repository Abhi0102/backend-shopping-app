const express = require("express");
const Router = express.Router();

const { addProduct } = require("../controllers/product");
const { isLoggedIn, customRole } = require("../middlewares/user");

Router.route("/addproduct").get(addProduct);

module.exports = Router;
