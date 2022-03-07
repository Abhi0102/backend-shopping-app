const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required."],
      trim: true,
      maxlength: [120, "Product name should not be more than 120 chars."],
    },
    price: {
      type: Number,
      required: [true, "Product price is required."],
      maxlength: [5, "Product price should not be more than 5 digits."],
    },
    description: {
      type: String,
      required: [true, "Product description is required."],
    },
    photos: [
      {
        id: {
          type: String,
          required: [true, "Image is required"],
        },
        secure_url: {
          type: String,
          required: [true, "Image is required"],
        },
      },
    ],
    category: {
      type: String,
      required: [true, "Product category is required."],
      enum: {
        values: ["shortsleeves", "longsleeves", "sweatshirt", "hoodies"],
        message:
          "Please select categories from shortsleeves, longsleeves, sweatshirt, hoodies",
      },
    },
    brand: {
      type: String,
      required: [true, "Product Brand is required."],
    },
    ratings: {
      type: Number,
      default: 0,
    },
    noOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
  