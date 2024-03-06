import { it, describe, expect, expectTypeOf } from "vitest";
import {
  deleteFile,
  uploadImageToImageKit,
  deleteFileFromImageKit,
} from "./file.js";
import fs from "fs";
import path from "path";
import imageKit from "./image-kit.js";

describe("deleteFile()", () => {
  it("should delete the file from images folder", async () => {
    const filename = "test.txt";
    const filePath = path.join("uploads", "images", filename);

    const saveFile = async () => {
      try {
        await fs.promises.writeFile(filePath, "test", "");
        console.log("File saved successfully");
      } catch (error) {
        throw error;
      }
    };

    const delFile = async () => {
      try {
        await deleteFile(filename);
        console.log("File deleted successfully");
      } catch (error) {
        throw error;
      }
    };

    try {
      await saveFile();
      await delFile();

      const fileDeleted = !fs.existsSync(filePath);
      expect(fileDeleted).toBeTruthy();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  });
});

describe("deleteFileFromImageKit()", () => {
  it("should delete file from image kit", async () => {
    try {
      const files = await imageKit.listFiles({
        path: "test",
      });

      files.forEach(async (file) => {
        const result = await deleteFileFromImageKit(file.name, file.fileId);

        expect(result).toBe("File deleted successfully");
      });
    } catch (error) {
      console.error("Error: " + error);
    }
  });
});

describe("uploadImageToImageKit()", () => {
  it("should upload file to image kit", async () => {
    const fileName = "test-image.jpg";
    const imageKitFoldersName = "test";
    const imagePath = path.join("uploads", "images", fileName);

    const saveFile = async () => {
      try {
        const result = await uploadImageToImageKit(
          imagePath,
          fileName,
          imageKitFoldersName
        );

        return result;
      } catch (error) {
        throw error;
      }
    };

    const verifyFolder = async () => {
      try {
        const files = await imageKit.listFiles({
          path: "test",
        });

        return files;
      } catch (error) {
        throw error;
      }
    };

    try {
      const saveFileResult = await saveFile();
      const verifyFolderResult = await verifyFolder();

      expectTypeOf(saveFileResult).toBeObject();
      expect(saveFileResult).toHaveProperty("fileId");
      expectTypeOf(verifyFolderResult).toBeArray();
    } catch (error) {
      console.error("Error: " + error);
    }
  });
});
