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


////////////////////////////////CORS/////////////////////////////////
const cors = require('cors');
const corsOptions = {
    origin: ["http://localhost:5173", process.env.ORIGIN],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control',
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};
app.use(cors(corsOptions));

////////////////////////////////CORS///////////////////////////////
// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
const autRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const contentRoutes = require("./routes/content.routes");
const clicksRoutes = require("./routes/clicks.routes");

app.use("/api", indexRoutes);
app.use("/auth", autRoutes);
app.use("/user", userRoutes);
app.use("/content", contentRoutes);
app.use("/clicks", clicksRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
const errorHandler = require('./middleware/errorHandler');
app.use('/api/content', contentRoutes);
app.use(errorHandler);


module.exports = app;
