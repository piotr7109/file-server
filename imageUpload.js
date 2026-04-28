const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { randomUUID } = require("crypto");
const { default: axios } = require("axios");

const MAX_SIZE = 1000;
const PREVIEW_SIZE = 500;

const uploadFile = async (
  imageSharp,
  imageName,
  size,
  keepOriginalSize = false
) => {
  const { width = 0, height = 0 } = await imageSharp.metadata();
  const imageWidth = keepOriginalSize
    ? width
    : width > height
    ? Math.min(size, width)
    : undefined;
  const imageHeight = keepOriginalSize
    ? height
    : width <= height
    ? Math.min(size, height)
    : undefined;
  const file = await imageSharp
    .resize({
      fit: sharp.fit.contain,
      width: imageWidth,
      height: imageHeight,
    })
    .jpeg()
    .toBuffer();

  try {
    await axios.put(`${process.env.BUNNY_ZONE_URL}/${imageName}`, file, {
      headers: {
        AccessKey: process.env.BUNNY_ACCESS_KEY,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (err) {
    console.log(err);
  }
};

const imageUploadHandler = asyncHandler(async (req, res) => {
  const { prefix, keepOriginalSize, fileName } = req.query;
  const image = req.files.file;

  const imageBuffer = image.data.buffer;
  const imageSharp = sharp(imageBuffer);

  const baseImageName = `${prefix ? `${prefix}-` : ""}${
    fileName || randomUUID()
  }`;
  const imageName = `${baseImageName}.jpg`;

  if (keepOriginalSize === "true") {
    await uploadFile(imageSharp, imageName, MAX_SIZE, true);
  } else {
    const imageNamePreview = `${baseImageName}_preview.jpg`;
    await Promise.all([
      uploadFile(imageSharp, imageName, MAX_SIZE),
      uploadFile(imageSharp, imageNamePreview, PREVIEW_SIZE),
    ]);
  }

  res.send({ filename: imageName });
});

exports.imageUploadHandler = imageUploadHandler;
