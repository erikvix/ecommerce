import express from "express";
import cors from "cors";
import usersRouter from "./routes/userRouter";
import initializeDatabase from "./database/database.init";
import productsRouter from "./routes/productsRouter";
import path from "path";
import { configDotenv } from "dotenv";

const app = express();
const port = 8080;
configDotenv();

initializeDatabase();

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "../src/uploads")));

app.use("/users", usersRouter);
app.use("/products", productsRouter);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
