import fs from "fs";
import path from "path";
import imageKit from "../util/image-kit.js";

const fsPromises = fs.promises;

const deleteFile = async (filename) => {
  const filePath = path.join("uploads", "images", filename);

  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) throw err;
      console.log("File deleted successfully");
    });
  } else {
    return "File does not exist or have already been deleted";
  }
};

const deleteFileFromImageKit = async (filename, fileId) => {
  try {
    const res = await imageKit.listFiles({
      searchQuery: `name="${filename}"`,
    });

    if (res.length > 0) {
      await imageKit.deleteFile(fileId);
    }

    return "File deleted successfully";
  } catch (error) {
    throw new Error(error);
  }
};

const uploadImageToImageKit = async (filepath, filename, imageKitFolder) => {
  try {
    const fileBuffer = await fsPromises.readFile(filepath);

    if (fileBuffer) {
      const uploadRes = imageKit.upload({
        file: fileBuffer,
        fileName: filename,
        folder: imageKitFolder,
      });

      return uploadRes;
    }
  } catch (error) {
    throw new Error(error);
  }
};

export { deleteFile, deleteFileFromImageKit, uploadImageToImageKit };
