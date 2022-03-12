const express = require("express");
const Router = express.Router();

const {
  createOrder,
  getOneOrder,
  getUserOrders,
} = require("../controllers/order");
const { isLoggedIn, customRole } = require("../middlewares/user");

Router.route("/order/create").post(isLoggedIn, createOrder);

Router.route("/order/:id").get(isLoggedIn, getOneOrder);
Router.route("/myorder").get(isLoggedIn, getUserOrders);

module.exports = Router;
