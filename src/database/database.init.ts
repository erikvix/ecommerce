import db from "./database.config";

const initializeDatabase = () => {
  const createTableSQL = `

  CREATE TABLE IF NOT EXISTS users ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name INTEGER NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL
);
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    categoryId INTEGER NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT,
    FOREIGN KEY (categoryId) REFERENCES category (id)
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total REAL NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES products (id)
);
 
  `;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error("Error creating table:", err.message);
    } else {
      console.log("Database initialized: all table created.");
    }
  });
};

initializeDatabase();

export default initializeDatabase;
