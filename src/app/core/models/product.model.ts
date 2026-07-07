export interface Product {
  id: number;
  code?: string;
  name: string;
  description?: string;
  status?: number;
  height?: number;
  weight?: number;
  quantity?: number;
  price: number;
  categoryId?: number;
  deleted?: boolean;
  createdDate?: string;
  updatedDate?: string;
  createdBy?: string;
  updatedBy?: string;
  imageUrl?: string;
  isImageMain?: boolean;
}

// Generic API response
export interface ApiResponse<T> {
  result: T;
  code?: number;
  message?: string;
}

// Page wrapper
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
