const express = require("express");
const Router = express.Router();

const {
  sendStripeKey,
  captureStripePayment,
} = require("../controllers/payment");

const { isLoggedIn, customRole } = require("../middlewares/user");

Router.route("/stripekey").get(isLoggedIn, sendStripeKey);
Router.route("/capturestripe").post(isLoggedIn, captureStripePayment);

module.exports = Router;
