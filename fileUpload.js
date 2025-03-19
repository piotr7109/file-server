const asyncHandler = require("express-async-handler");
const { default: axios } = require("axios");

const uploadFileHandler = asyncHandler(async (req, res) => {
  const files = req.files.file;
  const file = Array.isArray(files) ? files[0] : files;

  await axios.put(`${process.env.BUNNY_ZONE_URL}/${file.name}`, file, {
    headers: {
      AccessKey: process.env.BUNNY_ACCESS_KEY,
      "Content-Type": "application/octet-stream",
    },
  });

  res.send({ filename: file.name });
});

exports.uploadFileHandler = uploadFileHandler;
