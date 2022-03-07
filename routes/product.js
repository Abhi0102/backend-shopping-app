const express = require("express");
const Router = express.Router();

const { addProduct, getProduct } = require("../controllers/product");
const { isLoggedIn, customRole } = require("../middlewares/user");

Router.route("/addproduct").post(isLoggedIn, customRole("admin"), addProduct);
Router.route("/getproducts").get(getProduct);

module.exports = Router;
