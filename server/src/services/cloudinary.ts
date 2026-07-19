import { cloudinary, isConfigured } from "@/config/cloudinary";
import fs from "fs";

export async function uploadAvatar(filePath: string, publicId: string): Promise<string | null> {
  if (!isConfigured) return null;

  const result = await cloudinary.uploader.upload(filePath, {
    folder: "avatars",
    public_id: publicId,
    overwrite: true,
    transformation: [{ width: 400, height: 400, crop: "fill", quality: "auto" }],
  });

  return result.secure_url;
}

export async function uploadServiceImage(filePath: string, publicId: string): Promise<string | null> {
  if (!isConfigured) return null;

  const result = await cloudinary.uploader.upload(filePath, {
    folder: "services",
    public_id: publicId,
    overwrite: true,
    transformation: [{ width: 800, height: 600, crop: "fill", quality: "auto" }],
  });

  return result.secure_url;
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!isConfigured) return;

  await cloudinary.uploader.destroy(publicId);
}

export async function deleteLocalFile(filePath: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath);
  } catch {
    // ignore if file doesn't exist
  }
}
