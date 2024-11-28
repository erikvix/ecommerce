import express from "express";
import cors from "cors";
import usersRouter from "./routes";
import initializeDatabase from "./database/database.init";

const app = express();
const port = 8080;

initializeDatabase();

app.use(express.json());
app.use(cors());

app.use("/users", usersRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
