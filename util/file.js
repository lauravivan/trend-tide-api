import fs from "fs";
import path from "path";
import imageKit from "../util/image-kit.js";

const fsPromises = fs.promises;

const deleteFile = async (file) => {
  const filePath = path.join("uploads", "images", file.filename);

  try {
    await fsPromises.access(filePath, fs.constants.F_OK);

    await fsPromises.unlink(filePath);

    return "File deleted succesfully from images folder";
  } catch (error) {
    throw new Error(error);
  }
};

const deleteFileFromImageKit = async (fileName, fileId) => {
  try {
    const res = await imageKit.listFiles({
      searchQuery: `name="${fileName}"`,
    });

    if (res) {
      await imageKit.deleteFile(fileId);
    }
  } catch (error) {
    throw new Error(error);
  }
};

const uploadImageToImageKit = async (file, imageKitFolder) => {
  try {
    const fileBuffer = await fsPromises.readFile(file.path);

    if (fileBuffer) {
      const uploadRes = imageKit.upload({
        file: fileBuffer,
        fileName: file.filename,
        folder: imageKitFolder,
      });

      return uploadRes;
    }
  } catch (error) {
    throw new Error(error);
  }
};

export { deleteFile, deleteFileFromImageKit, uploadImageToImageKit };
