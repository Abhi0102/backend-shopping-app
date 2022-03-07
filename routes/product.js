const express = require("express");
const Router = express.Router();

const {
  addProduct,
  getProduct,
  adminGetProducts,
  getOneProduct,
} = require("../controllers/product");
const { isLoggedIn, customRole } = require("../middlewares/user");

Router.route("/getproducts").get(getProduct);
Router.route("/product/:id").get(getOneProduct);

// Admin Routes

Router.route("/addproduct").post(isLoggedIn, customRole("admin"), addProduct);
Router.route("/admin/products").get(
  isLoggedIn,
  customRole("admin"),
  adminGetProducts
);

module.exports = Router;
