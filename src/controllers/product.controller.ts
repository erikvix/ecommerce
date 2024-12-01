import { Request, Response } from "express";
import db from "../database/database.config";
import { Product } from "../models/products";
import { Order } from "../models/order";
import upload from "../middleware/image.middleware";

interface ProductPayload {
  id: number;
  name: string;
  categoryId: number;
  description: string;
  quantity: number;
  price: number;
  image: string;
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
  const sql = `
    SELECT 
      p.id, 
      p.name, 
      p.categoryId, 
      p.description, 
      p.price, 
      i.path
    FROM products p
    LEFT JOIN images i ON p.id = i.productId`;

  db.all(sql, [], (err, products: Product[]) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ status: 500, message: "Erro ao buscar produtos" });
      return;
    }

    if (!products || products.length === 0) {
      res
        .status(404)
        .json({ status: 404, message: "Nenhum produto encontrado" });
      return;
    }
    console.log(products);

    const productsWithImageUrl = products.map((product) => ({
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      description: product.description,
      price: product.price,
      imageUrl: product.path
        ? `${req.protocol}://${req.get("host")}/${product.path}`
        : null,
    }));

    res.status(200).json({
      status: 200,
      data: productsWithImageUrl,
    });
  });
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      res.status(400).json({ status: 400, message: err.message });
      return;
    }

    const { name, categoryId, description, price }: Partial<ProductPayload> =
      req.body;

    if (!name || !categoryId || !price) {
      res
        .status(400)
        .json({ status: 400, message: "Dados obrigatórios faltando" });
      return;
    }

    const imagePath = req.file
      ? req.file.path.replace("/home/jusu/project/backend/src/", "")
      : null;
    console.log(imagePath);

    const productSql =
      "INSERT INTO products (name, categoryId, description, price, image) VALUES (?, ?, ?, ?, ?)";
    const productParams = [
      name,
      categoryId,
      description || "",
      price,
      imagePath,
    ];

    db.run(productSql, productParams, function (productErr) {
      if (productErr) {
        console.error(productErr.message);
        res.status(500).json({ status: 500, message: "Erro ao criar produto" });
        return;
      }

      const productId = this.lastID;

      if (imagePath) {
        const imageSql = "INSERT INTO images (productId, path) VALUES (?, ?)";
        const imageParams = [productId, imagePath];

        db.run(imageSql, imageParams, (imageErr) => {
          if (imageErr) {
            console.error(imageErr.message);
            res
              .status(500)
              .json({ status: 500, message: "Erro ao salvar imagem" });
            return;
          }

          res.status(201).json({
            status: 201,
            message: "Produto e imagem criados com sucesso",
            id: productId,
          });
        });
      } else {
        res.status(201).json({
          status: 201,
          message: "Produto criado com sucesso (sem imagem)",
          id: productId,
        });
      }
    });
  });
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      res.status(400).json({ status: 400, message: err.message });
      return;
    }

    const { id } = req.params;
    const { name, categoryId, description, price }: Partial<ProductPayload> =
      req.body;
    const file = req.file;

    if (!id) {
      res
        .status(400)
        .json({ status: 400, message: "ID do produto é obrigatório" });
      return;
    }
    const sqlProduct = `
      UPDATE products
      SET
        name = COALESCE(?, name),
        categoryId = COALESCE(?, categoryId),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        image = COALESCE(?, image)
      WHERE id = ?`;

    const paramsProduct = [
      name,
      categoryId,
      description,
      price,
      file?.path || null,
      id,
    ];

    db.run(sqlProduct, paramsProduct, function (err) {
      if (err) {
        console.error(err.message);
        res
          .status(500)
          .json({ status: 500, message: "Erro ao atualizar produto" });
        return;
      }

      if (this.changes === 0) {
        res
          .status(404)
          .json({ status: 404, message: "Produto não encontrado" });
        return;
      }
      if (file) {
        const imagePath = `uploads/${file.filename}`;
        const sqlImage = `
          UPDATE images 
          SET path = ? 
          WHERE productId = ?`;

        const paramsImage = [imagePath, id];

        db.run(sqlImage, paramsImage, function (err) {
          if (err) {
            console.error(err.message);
            res
              .status(500)
              .json({ status: 500, message: "Erro ao atualizar imagem" });
            return;
          }

          res.status(200).json({
            status: 200,
            message: "Produto e imagem atualizados com sucesso",
          });
        });
      } else {
        res
          .status(200)
          .json({ status: 200, message: "Produto atualizado com sucesso" });
      }
    });
  });
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = req.params.id;

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

    if (res.statusCode === 200) {
      db.run("DELETE FROM images WHERE productId = ?", [id], function (err) {
        if (err) {
          console.error(err.message);
          res
            .status(500)
            .json({ status: 500, message: "Erro ao deletar imagem" });
          return;
        }

        if (this.changes === 0) {
          res
            .status(404)
            .json({ status: 404, message: "Imagem não encontrada" });
          return;
        }
      });

      res
        .status(200)
        .json({ status: 200, message: "Produto deletado com sucesso" });
    }
  });
};

export const checkout = async (req: Request, res: Response): Promise<void> => {
  const { id: productId, quantity }: ProductPayload = req.body;

  if (!validatePayload(req.body, ["productId", "quantity"]) || quantity <= 0) {
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
        "INSERT INTO orders (productId, quantity, total) VALUES (?, ?, ?, ?)";
      const params = [productId, quantity, total];

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
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ status: 400, message: "Categoria é obrigatória" });
    return;
  }

  const sql = `
    SELECT 
      p.id, 
      p.name, 
      p.categoryId, 
      p.description, 
      p.price, 
      i.path
    FROM products p
    LEFT JOIN images i ON p.id = i.productId
    WHERE p.categoryId = ?`;

  db.all(sql, [id], (err, products: Product[]) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ status: 500, message: "Erro ao buscar produtos" });
      return;
    }

    if (!products || products.length === 0) {
      res
        .status(404)
        .json({ status: 404, message: "Nenhum produto encontrado" });
      return;
    }

    const productsWithImageUrl = products.map((product) => ({
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      description: product.description,
      price: product.price,
      imageUrl: product.path
        ? `${req.protocol}://${req.get("host")}/${product.path}`
        : null,
    }));

    res.status(200).json(productsWithImageUrl);
  });
};
