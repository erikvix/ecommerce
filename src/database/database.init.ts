import db from "./database.config";

const initializeDatabase = () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      senha TEXT NOT NULL
    );
  `;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error("Error creating table:", err.message);
    } else {
      console.log(
        "Database initialized: 'itens' table created if it did not exist."
      );
    }
  });
};

initializeDatabase();

export default initializeDatabase;
