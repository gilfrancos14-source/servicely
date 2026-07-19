import type { Request, Response, NextFunction } from "express";
import * as categoryService from "@/services/category";

export async function listCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await categoryService.listCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}
