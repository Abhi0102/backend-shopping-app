const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

// Swagger Related
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

// EJS
app.set("view engine", "ejs");

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/temp/" }));
app.use(cookieParser());

// Swagger Document Middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Logger Middleware
app.use(morgan("tiny"));

// Routes
const home = require("./routes/home");
const user = require("./routes/user");

//Route Middleware
app.use("/api/v1", home);
app.use("/api/v1", user);

// Test EJS

app.get("/testpic", (req, res) => res.render("signup"));

module.exports = app;
