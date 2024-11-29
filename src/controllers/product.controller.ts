import { Request, Response } from "express";
import db from "../database/database.config";
import { Product } from "../models/products";
import { Order } from "../models/order";

interface ProductPayload {
  id: number;
  name: string;
  categoryId: number;
  description: string;
  quantity: number;
  price: number;
  image: string;
  userId: number;
}

const validatePayload = (payload: ProductPayload, requiredFields: string[]) => {
  for (const field of requiredFields) {
    if (!payload[field as keyof ProductPayload]) {
      return false;
    }
  }
  return true;
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  db.get("SELECT * FROM products", [], async (err, product: Product | null) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ status: 500, message: "Server error" });
      return;
    }

    if (product) {
      res.status(200).json(product);
      return;
    }
  });
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, categoryId, description, price, image }: ProductPayload =
    req.body;

  if (
    !validatePayload(req.body, ["name", "categoryId", "description", "price"])
  ) {
    res
      .status(400)
      .json({ status: 400, message: "Dados obrigatórios faltando" });
    return;
  }

  const sql =
    "INSERT INTO products (name, categoryId, descricao, preco, imagem) VALUES (?, ?, ?, ?, ?)";
  const params = [name, categoryId, description, price, image || null];

  db.run(sql, params, function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ status: 500, message: "Erro ao criar produto" });
      return;
    }
    res.status(201).json({
      status: 201,
      message: "Produto criado com sucesso",
      id: this.lastID,
    });
  });
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id, name, categoryId, description, price, image }: ProductPayload =
    req.body;

  if (!id) {
    res
      .status(400)
      .json({ status: 400, message: "ID do produto é obrigatório" });
    return;
  }

  const sql =
    "UPDATE products SET name = ?, categoryId = ?, descricao = ?, preco = ?, imagem = ? WHERE id = ?";
  const params = [name, categoryId, description, price, image, id];

  db.run(sql, params, function (err) {
    if (err) {
      console.error(err.message);
      res
        .status(500)
        .json({ status: 500, message: "Erro ao atualizar produto" });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ status: 404, message: "Produto não encontrado" });
      return;
    }

    res
      .status(200)
      .json({ status: 200, message: "Produto atualizado com sucesso" });
  });
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id }: ProductPayload = req.body;

  if (!id) {
    res
      .status(400)
      .json({ status: 400, message: "ID do produto é obrigatório" });
    return;
  }

  db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ status: 500, message: "Erro ao deletar produto" });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ status: 404, message: "Produto não encontrado" });
      return;
    }

    res
      .status(200)
      .json({ status: 200, message: "Produto deletado com sucesso" });
  });
};

export const checkout = async (req: Request, res: Response): Promise<void> => {
  const { id: productId, userId, quantity }: ProductPayload = req.body;

  if (
    !validatePayload(req.body, ["productId", "userId", "quantity"]) ||
    quantity <= 0
  ) {
    res
      .status(400)
      .json({ status: 400, message: "Dados inválidos para o checkout" });
    return;
  }

  db.get(
    "SELECT * FROM products WHERE id = ?",
    [productId],
    (err, product: Product) => {
      if (err) {
        console.error(err.message);
        res
          .status(500)
          .json({ status: 500, message: "Erro ao buscar produto" });
        return;
      }

      if (!product) {
        res
          .status(404)
          .json({ status: 404, message: "Produto não encontrado" });
        return;
      }

      const total = product.price * quantity;

      const sql =
        "INSERT INTO orders (productId, userId, quantity, total) VALUES (?, ?, ?, ?)";
      const params = [productId, userId, quantity, total];

      db.run(sql, params, function (err) {
        if (err) {
          console.error(err.message);
          res
            .status(500)
            .json({ status: 500, message: "Erro ao registrar compra" });
          return;
        }

        res.status(201).json({
          status: 201,
          message: "Compra realizada com sucesso",
          orderId: this.lastID,
          total,
        });
      });
    }
  );
};

export const getHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const payload: ProductPayload = req.body;
  if (!validatePayload(payload, ["id"])) {
    res.status(400).json({ status: 400, message: "Missing fields" });
    return;
  }
  db.run(
    "SELECT * FROM products WHERE id = ?",
    [payload.id],
    async (err: Error, order: Order | null) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ status: 500, message: "Server error" });
        return;
      }

      if (order) {
        res.status(400).json(order);
        return;
      }
    }
  );
};

export const getProductsByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const categoryId = req.params.id;

  if (!categoryId) {
    res
      .status(400)
      .json({ status: 400, message: "ID da categoria é obrigatório" });
    return;
  }

  db.all(
    "SELECT * FROM products WHERE categoryId = ?",
    [categoryId],
    (err, products) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({
          status: 500,
          message: "Erro ao buscar produtos por categoria",
        });
        return;
      }
      res.status(200).json(products);
    }
  );
};
