import { Document, Schema } from "mongoose";
import { Categories } from "./categories";

export interface SubCategories extends Document {
  name: string;
  category: Categories;
  image: string;
}