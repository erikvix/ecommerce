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
import authToken from "../middleware/auth.middleware";

const productsRouter = Router();

productsRouter.get("/", authToken, getAll);
productsRouter.get("/category/:id", authToken, getProductsByCategory);
productsRouter.post("/", authToken, createProduct);
productsRouter.put("/:id", authToken, updateProduct);
productsRouter.delete("/:id", authToken, deleteProduct);
productsRouter.get("/history", authToken, getHistory);
productsRouter.post("/checkout", authToken, checkout);

export default productsRouter;
