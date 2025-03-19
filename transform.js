import fs, { readFileSync, writeFileSync } from "fs";
import path from "path";
import sharp from "sharp";

const isFile = (fileName: string) => {
  return fs.lstatSync(fileName).isFile();
};
const files = fs
  .readdirSync("files")
  .map((fileName: string) => {
    return path.join("files", fileName);
  })
  .filter(isFile);

(async () => {
  await Promise.all(
    files.map(async (filePath: string) => {
      try {
        const fileName = filePath.split("\\")[1].split(".")[0];
        const fileBuffer = readFileSync(filePath);
        const imageSharp = sharp(fileBuffer);
        const { width = 0, height = 0 } = await imageSharp.metadata();
        const file = await imageSharp
          .resize({
            fit: sharp.fit.contain,
            width: width > height ? Math.min(500, width) : undefined,
            height: width <= height ? Math.min(500, height) : undefined,
          })
          .jpeg()
          .toBuffer();

        writeFileSync(`preview/${fileName}_preview.jpg`, file);
      } catch {
        console.log(filePath);
      }
    })
  );
})();
