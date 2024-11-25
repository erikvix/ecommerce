import sqlite3 from "sqlite3";
import { Database } from "sqlite3";

class DBService {
  private db: Database;

  constructor(dbInstance: Database) {
    this.db = dbInstance;
  }

  run(
    query: string,
    params: any[],
    callback: (err: Error | null, lastID: number | null) => void
  ): void {
    this.db.run(query, params, function (err) {
      callback(err, this?.lastID ?? null);
    });
  }

  all(
    query: string,
    params: any[],
    callback: (err: Error | null, rows: any[]) => void
  ): void {
    this.db.all(query, params, function (err, rows) {
      callback(err, rows);
    });
  }

  get(
    query: string,
    params: any[],
    callback: (err: Error | null, row: any | null) => void
  ): void {
    this.db.get(query, params, function (err, row) {
      callback(err, row);
    });
  }
}

export default DBService;
