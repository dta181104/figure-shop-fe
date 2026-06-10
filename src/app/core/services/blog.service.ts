import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseData } from '../models/response-data.model';
import { BlogItem, ProductItems } from '../models/product-item.model';
import { ApiResponse, Page } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private http = inject(HttpClient);
  constructor() {}

  detailBlog(id: number): Observable<ResponseData<ProductItems>> {
    return this.http.get<any>(`https://ninedev-api.vercel.app/blogs/${id}`);
  }

  postBlog(blogItem: BlogItem): Observable<ResponseData<ProductItems>> {
    return this.http.post<any>(`https://ninedev-api.vercel.app/blogs`, blogItem);
  }

  deleteBlog(id: number): Observable<ResponseData<ProductItems>> {
    return this.http.delete<any>(`https://ninedev-api.vercel.app/blogs/${id}`);
  }
}
