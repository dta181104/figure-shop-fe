export interface ProductRequest {
  code?: string;
  status?: number;
  name: string;
  description?: string;
  height?: number | null;
  weight?: number | null;
  quantity?: number | null;
  price?: number | null;
  images?: Array<{
    imageUrl?: string;
    imageFile?: File;
    isMainImage?: boolean;
  }>;
}
