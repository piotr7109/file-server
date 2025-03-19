const asyncHandler = require("express-async-handler");
const { default: axios } = require("axios");

const uploadBackupHandler = asyncHandler(async (req, res) => {
  const files = req.files.file;
  const file = Array.isArray(files) ? files[0] : files;

  await axios.put(
    `${process.env.BUNNY_BACKUPS_ZONE_URL}/${req.query.fileName}`,
    file.data,
    {
      params: {
        token: process.env.BUNNY_BACKUPS_TOKEN,
      },
      headers: {
        AccessKey: process.env.BUNNY_BACKUPS_ACCESS_KEY,
        "Content-Type": "application/zip",
      },
    }
  );

  res.send({ filename: file.name });
});

exports.uploadBackupHandler = uploadBackupHandler;
