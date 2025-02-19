const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const http = require("http");

// Initialize Express App
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Logging to check if server starts properly
console.log("🚀 Server script is starting...");

// Load Passport Configuration
require("./config/passport")(passport);

// MongoDB Configuration
const db = process.env.MONGO_URI || require("./config/key").MongoURI;
mongoose.set("strictQuery", false);
mongoose
  .connect(db)
  .then(() => console.log("✅ Successfully connected to MongoDB"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Express Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true,
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/api/currency", require("./routes/currencyRoutes"));

// Middleware for Errors
app.use(require("./middlewares/ErrorHandler"));

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ code: 404, message: "Not found" });
});

// Error Handlers
const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(err.status || 500).json({ errors: { message: err.message, error: err } });
  });
}

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ errors: { message: err.message, error: {} } });
});

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
server.listen(PORT, () => {
  console.log(`✅ Server running on PORT ${PORT}`);
});
