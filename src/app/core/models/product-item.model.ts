// src/app/types/productItem.ts
export interface ProductItems {
  id: number;
  code?: string;
  name: string;
  description?: string;
  status?: number;
  height?: number;
  weight?: number;
  quantity?: number;
  price: number;
  category_id?: number;
  deleted?: boolean;
  createdDate?: string;
  updatedDate?: string;
  createdBy?: string;
  updatedBy?: string;
  images?: ImageItem[];
}

export interface ImageItem {
  idImage?: number;
  imageUrl?: string;
  imageMain?: boolean;
}

export type BlogItem = {
  id?: number;
  title?: string;
  body?: string;
  author?: string;
};
