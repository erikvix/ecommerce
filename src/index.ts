import express from "express";
import cors from "cors";
import usersRouter from "./routes/userRouter";
import initializeDatabase from "./database/database.init";
import productsRouter from "./routes/productsRouter";

const app = express();
const port = 8080;

initializeDatabase();

app.use(express.json());
app.use(cors());

app.use("/users", usersRouter);
app.use("/products", productsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
