const asyncHandler = require("express-async-handler");
const { default: axios } = require("axios");

const uploadFileHandler = asyncHandler(async (req, res) => {
  const files = req.files.file;
  const file = Array.isArray(files) ? files[0] : files;
  const fileName = req.query.fileName || file.name;

  await axios.put(`${process.env.BUNNY_ZONE_URL}/${fileName}`, file.data, {
    headers: {
      AccessKey: process.env.BUNNY_ACCESS_KEY,
      "Content-Type": "application/octet-stream",
    },
  });

  res.send({ filename: fileName });
});

exports.uploadFileHandler = uploadFileHandler;
