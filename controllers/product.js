const Product = require("../models/product");
const BigPromise = require("../middlewares/bigPromise");
const WhereClause = require("../utils/whereclause");
const cloudinary = require("cloudinary").v2;

exports.testProduct = BigPromise(async (req, res, next) => {
  res.status(200).json({
    success: true,
    greatings: "Hello there !!!",
    params: req.query,
  });
});

exports.addProduct = BigPromise(async (req, res, next) => {
  // Images
  let imgArray = [];
  if (!req.files) {
    return next(new Error("Images are required"));
  }
  if (req.files) {
    for (let i in req.files.photos) {
      let result = await cloudinary.uploader.upload(
        req.files.photos[i].tempFilePath,
        {
          folder: "products",
        }
      );
      imgArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imgArray;

  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getProduct = BigPromise(async (req, res, next) => {
  const resultPerPage = 6;
  const totalCount = await Product.countDocuments();

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();
  // .pager();

  let products = productsObj.base;

  const filteredProductNumber = products.length;

  productsObj.pager(resultPerPage);

  products = await productsObj.base;

  res
    .status(200)
    .json({ success: true, products, filteredProductNumber, totalCount });
});

exports.adminGetProducts = BigPromise(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({ success: true, products });
});

exports.getOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new Error("No Product Found."));
  }

  res.status(200).json({ success: true, product });
});

exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new Error("No Product Found."));
  }

  if (req.files) {
    //   Delete Previous Photos
    for (let i in product.photos) {
      const result = await cloudinary.uploader.destroy(product.photos[i].id);
    }

    //   Uploading new Photos

    let imgArray = [];

    for (let i in req.files.photos) {
      let result = await cloudinary.uploader.upload(
        req.files.photos[i].tempFilePath,
        {
          folder: "products",
        }
      );
      imgArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }

    req.body.photos = imgArray;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, product });
});

exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new Error("No Product Found."));
  }

  //   Delete Images
  for (let i in product.photos) {
    const result = await cloudinary.uploader.destroy(product.photos[i].id);
  }

  await product.remove();

  res
    .status(200)
    .json({ success: true, message: "Product successfully deleted." });
});

exports.addReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  if (!product) {
    return next(new Error("Product not Found"));
  }

  const alreadyReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    product.reviews.forEach((element) => {
      if (element.user.toString() === req.user._id.toString()) {
        element.comment = comment;
        element.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.noOfReviews = product.reviews.length;
  }

  //   Adjust Rating

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({ success: true });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
  const { productId } = req.query;
  const product = await Product.findById(productId);

  if (!product) {
    return next(new Error("No Product Found."));
  }

  const reviews = product.reviews.filter(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  const noOfReviews = reviews.length;

  //   Adjust Rating

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  // Updating the product

  await product.findByIdAndUpdate(
    productId,
    { reviews, rating, noOfReviews },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true });
});
