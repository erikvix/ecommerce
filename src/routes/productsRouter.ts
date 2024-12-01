import { Router } from "express";
import {
  checkout,
  createProduct,
  deleteProduct,
  getAll,
  getHistory,
  getProductsByCategory,
  updateProduct,
} from "../controllers/product.controller";

const productsRouter = Router();

productsRouter.get("/", getAll);
productsRouter.get("/category/:id", getProductsByCategory);
productsRouter.post("/", createProduct);
productsRouter.put("/:id", updateProduct);
productsRouter.delete("/:id", deleteProduct);
productsRouter.get("/history", getHistory);
productsRouter.post("/checkout", checkout);

export default productsRouter;
