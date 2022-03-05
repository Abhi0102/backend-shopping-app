require("dotenv").config();
const connect = require("./config/db");
const app = require("./app");
const cloudinary = require("cloudinary");

// DB connect
connect();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(process.env.PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server is running on port: ${process.env.PORT}`);
  }
});
