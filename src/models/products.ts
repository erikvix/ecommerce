import { Category } from "./category";

export type Product = {
  id: number;
  name: string;
  categoryId: Category["id"];
  description: string;
  quantity: number;
  price: number;
  path: string;
};
