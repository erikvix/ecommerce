import express from "express";
import cors from "cors";
import { createConnection } from "sqlite3";
import { Product } from "./models/product";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get("/products", (req, res) => {
  const db = createConnection("ecommerce.db");
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) {
      console.error(err.message);
      return;
    }
    res.json(rows);
  });
});

app.post("/products", (req, res) => {
  const db = createConnection("ecommerce.db");
  const product = new Product(req.body);
  db.run("INSERT INTO products (name, price, description) VALUES (?, ?, ?)", [
    product.name,
    product.price,
    product.description,
  ]);
  res.json(product);
});

app.put("/products/:id", (req, res) => {
  const db = createConnection("ecommerce.db");
  const product = new Product(req.body);
  db.run(
    "UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?",
    [product.name, product.price, product.description, req.params.id]
  );
  res.json(product);
});

app.delete("/products/:id", (req, res) => {
  const db = createConnection("ecommerce.db");
  db.run("DELETE FROM products WHERE id = ?", [req.params.id]);
  res.json({ message: "Product deleted successfully" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
