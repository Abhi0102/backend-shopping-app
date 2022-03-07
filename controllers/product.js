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
