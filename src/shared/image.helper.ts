import sharp from "sharp";
/**
 * Converts an image file to a base64-encoded string with JPEG format and specified quality settings.
 * @param file The image file to be converted.
 * @returns A Promise that resolves to a base64-encoded string representing the converted image.
 */
export async function compriseImage(file: Express.Multer.File) {
  const image = await sharp(file.buffer)
    .resize(1000)
    .jpeg({ quality: 80, progressive: true, force: true })
    .toBuffer();
  return image.toString("base64");
}
