const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
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

// Validate Password with user entered Password

userSchema.methods.isValidPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
