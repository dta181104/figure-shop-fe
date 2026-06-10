import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, Page } from '../models/product.model';
import { ProductItems } from '../models/product-item.model';

export interface ProductQueryParams {
  pageIndex?: number;
  pageSize?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  sortBy?: 'HEIGHT' | 'NAME' | 'UPDATED_DATE' | 'PRICE' | 'WEIGHT';
  sortDirection?: 'ASC' | 'DESC';
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  getProducts(params?: ProductQueryParams | any): Observable<ApiResponse<Page<ProductItems>>> {
    // Clean up undefined/null params before sending
    let cleanParams: any = {};
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          cleanParams[key] = params[key];
        }
      });
    }
    return this.http.get<ApiResponse<Page<ProductItems>>>(`product`, { params: cleanParams });
  }

  getProductById(id: string): Observable<ApiResponse<ProductItems>> {
    return this.http.get<ApiResponse<ProductItems>>(`product/${id}`);
  }

  createProduct(payload: Partial<ProductItems>): Observable<ApiResponse<ProductItems>> {
    return this.http.post<ApiResponse<ProductItems>>('product', payload);
  }

  updateProduct(
    code: string,
    payload: Partial<ProductItems>
  ): Observable<ApiResponse<ProductItems>> {
    return this.http.put<ApiResponse<ProductItems>>(`product/${code}`, payload);
  }

  deleteProduct(code: string): Observable<ApiResponse<ProductItems>> {
    return this.http.delete<ApiResponse<ProductItems>>(`product/${code}`);
  }
}
