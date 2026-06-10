import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private apiUrl = 'https://provinces.open-api.vn/api/v1/';

  constructor(private http: HttpClient) {}

  getProvinces(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}provinces`);
  }

  getDistricts(provinceId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}districts/${provinceId}`);
  }

  getWards(districtId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}wards/${districtId}`);
  }
}
