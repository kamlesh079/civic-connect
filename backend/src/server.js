const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const routes = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");
const AppError = require("./utils/AppError");

const { uploadRoot } = require("./middlewares/upload");

dotenv.config();

connectDB();

const app = express();


app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",

    credentials: true,
  }),
);

// JSON remains enabled for existing
// non-multipart API requests.
app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    limit: "1mb",
    extended: true,
  }),
);

// Uploaded images are served as public assets.
app.use(
  "/uploads",
  express.static(uploadRoot, {
    fallthrough: false,
    index: false,
    dotfiles: "deny",
    maxAge: "1d",
  }),
);

app.use("/api", routes);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
