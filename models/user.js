const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name."],
      maxlength: [
        50,
        "Name exceeded the no. of chars. Should be below 50 chars.",
      ],
    },

    email: {
      type: String,
      required: [true, "Please provide Email."],
      validate: [validator.isEmail, "Invalid Email."],
      unique: [true, "Email already present."],
    },

    password: {
      type: String,
      required: [true, "Please provide Password."],
      minlength: [8, "Password should be more than 7 chars."],
      // Select - false => Password will not be fetched while fetching the user. Need to be explicitly define when required
      select: false,
    },
    role: {
      type: String,
      default: "user",
      required: [true, "Role of customer is missing"],
    },
    photo: {
      id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  { timestamps: true }
);

// Model Shold be defined before encrypting passwords
// Encrypting Password.
// Arrow function will not work here as per Mongoose
// next should be pass to chain it to other functions

// HOOKS

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Methods

// Validate Password with user entered Password

userSchema.methods.isValidPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// JWT Tokens

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id, name: this.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

// Forgot Password token - string -> JWT is not preferable here.

userSchema.methods.forgotPassword = function () {
  // generate random long string
  const token = crypto.randomBytes(20).toString("hex");

  //    Getting a hash - hashed value will stored in DB.
  //    Whenever a token is sent from user it will be hashed and compare with DB value.
  //    Thus ensuring that it is not tempered.

  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

  return token;
};

module.exports = mongoose.model("User", userSchema);
