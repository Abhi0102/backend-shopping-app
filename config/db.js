const mongoose = require("mongoose");

const connect = () => {
  mongoose
    .connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("Successfully connected to DB"))
    .catch((error) => {
      console.log("Failed to connect to Database");
      console.log(error);
      process.exit(1);
    });
};

module.exports = connect;
