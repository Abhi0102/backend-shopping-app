const Order = require("../models/order");
const Product = require("../models/product");
const BigPromise = require("../middlewares/bigPromise");

exports.createOrder = BigPromise(async (req, res, next) => {
  const {
    shipingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shipingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });
  res.status(200).json({
    success: true,
    order,
  });
});

exports.getOneOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new Error("Order Id is wrong."));
  }

  res.status(200).json({ success: true, order });
});

exports.getUserOrders = BigPromise(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  if (!order) {
    return next(new Error("Order Id is wrong."));
  }

  res.status(200).json({ success: true, order });
});
