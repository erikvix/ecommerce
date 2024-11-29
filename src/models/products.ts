import { Category } from "./category";

export type Product = {
  id: number;
  name: string;
  category: Category;
  description: string;
  quantity: number;
  price: number;
  image: string;
  userId: number;
};
