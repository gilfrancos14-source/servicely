import { Router } from "express";
import multer from "multer";
import path from "path";
import { authenticate } from "@/middlewares/auth";
import * as uploadController from "@/controllers/upload";

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/avatars"));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}${ext}`);
  },
});

const serviceImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/services"));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `service-${Date.now()}${ext}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Format non autorisé. Utilisez JPEG, PNG ou WEBP."));
      return;
    }
    cb(null, true);
  },
});

const uploadServiceImage = multer({
  storage: serviceImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Format non autorisé. Utilisez JPEG, PNG ou WEBP."));
      return;
    }
    cb(null, true);
  },
});

const router = Router();

router.use(authenticate);

router.post("/avatar", uploadAvatar.single("file"), uploadController.uploadAvatar);
router.post("/service-image", uploadServiceImage.single("file"), uploadController.uploadServiceImage);

export default router;
