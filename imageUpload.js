const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { randomUUID } = require("crypto");

const MAX_SIZE = 1000;

const imageUploadHandler = asyncHandler(async (req, res) => {
  const { prefix } = req.body;
  const image = req.files.file;

  const imageBuffer = image.data.buffer;
  const imageSharp = sharp(imageBuffer);
  const { width = 0, height = 0 } = await imageSharp.metadata();

  const imageName = `${prefix ? `${prefix}-` : ""}${randomUUID()}.jpg`;
  const imagePathname = `uploads/${imageName}`;

  await imageSharp
    .resize({
      fit: sharp.fit.contain,
      width: width > height ? Math.min(MAX_SIZE, width) : undefined,
      height: width <= height ? Math.min(MAX_SIZE, height) : undefined,
    })
    .jpeg()
    .toFile(imagePathname);

  res.send({ filename: imageName });
});

exports.imageUploadHandler = imageUploadHandler;
