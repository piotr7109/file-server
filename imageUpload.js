const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { randomUUID } = require("crypto");
const { Client } = require("basic-ftp");
const { Readable } = require("stream");

const MAX_SIZE = 1000;

const imageUploadHandler = asyncHandler(async (req, res) => {
  const { prefix } = req.query;
  const image = req.files.file;

  const imageBuffer = image.data.buffer;
  const imageSharp = sharp(imageBuffer);
  const { width = 0, height = 0 } = await imageSharp.metadata();

  const imageName = `${prefix ? `${prefix}-` : ""}${randomUUID()}.jpg`;
  const imagePathname = `uploads/${imageName}`;

  const file = await imageSharp
    .resize({
      fit: sharp.fit.contain,
      width: width > height ? Math.min(MAX_SIZE, width) : undefined,
      height: width <= height ? Math.min(MAX_SIZE, height) : undefined,
    })
    .jpeg()
    .toBuffer();
  const client = new Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: process.env.BUNNY_HOST,
      user: process.env.BUNNY_USER,
      password: process.env.BUNNY_PASSWORD,
      secure: true,
    });
    console.log(await client.list());
    await client.uploadFrom(Readable.from(file), imageName);
  } catch (err) {
    console.log(err);
  }
  client.close();

  res.send({ filename: imageName });
});

exports.imageUploadHandler = imageUploadHandler;
