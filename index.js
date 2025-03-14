const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const app = express();
const dotenv = require("dotenv");

const asyncHandler = require("express-async-handler");
const { imageUploadHandler } = require("./imageUpload");
const { unlink } = require("fs/promises");
const compression = require("compression");
const { default: helmet } = require("helmet");
const cors = require("cors");

dotenv.config();

app.use(cors());
app.use(compression());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Middleware to handle file uploads
app.use(fileUpload());

// Serve static files from the 'uploads' directory
// app.use("/", express.static(path.join(__dirname, "uploads")));
app.use("/mail", express.static(path.join(__dirname, "mail")));

const validateToken = asyncHandler((req, res, next) => {
  if (!process.env.TOKEN || req.query.token !== process.env.TOKEN) {
    return res.sendStatus(403);
  }

  next();
});

const validateUpload = asyncHandler(validateToken, (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  next();
});

app.get("/:imageId", (req, res) => {
  res.send(`${process.env.BUNNY_BUCKET}/${req.params.imageId}`);
});

app.post("/image", validateUpload, imageUploadHandler);

app.delete("/", validateToken, async (req, res) => {
  // try {
  //   await unlink("uploads/" + req.query.id);
  //   res.sendStatus(200);
  // } catch (e) {
  //   res.sendStatus(404);
  // }
});

// Start server
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
