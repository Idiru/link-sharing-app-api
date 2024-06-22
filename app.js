// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// ℹ️ Connects to the database

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const app = express();

////////////////////////////////CORS///////////////////////////////
// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
const autRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const contentRoutes = require("./routes/content.routes");

app.use("/api", indexRoutes);
app.use("/auth", autRoutes);
app.use("/user", userRoutes);
app.use("/content", contentRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

const { authError } = require("./error-handling/authError");
app.use(authError);

module.exports = app;
