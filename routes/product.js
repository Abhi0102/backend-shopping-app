const express = require("express");
const Router = express.Router();

const {
  addProduct,
  getProduct,
  adminGetProducts,
  getOneProduct,
  adminUpdateOneProduct,
  adminDeleteOneProduct,
  addReview,
  deleteReview,
} = require("../controllers/product");
const { isLoggedIn, customRole } = require("../middlewares/user");

Router.route("/getproducts").get(getProduct);
Router.route("/product/:id").get(getOneProduct);

Router.route("/addreview").put(isLoggedIn, addReview);
Router.route("/deletereview").delete(isLoggedIn, deleteReview);

// Admin Routes

Router.route("/addproduct").post(isLoggedIn, customRole("admin"), addProduct);
Router.route("/admin/products").get(
  isLoggedIn,
  customRole("admin"),
  adminGetProducts
);
Router.route("/admin/product/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateOneProduct)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneProduct);

module.exports = Router;
