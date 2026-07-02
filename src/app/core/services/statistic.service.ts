import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the interfaces based on the API documentation
export interface StatisticResponse {
  totalUsers?: number;
  totalProducts?: number;
  // Add other general statistic properties if they appear in the future
}

export interface StatisticResult {
  time: string;
  revenue: number;
  totalBills: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticService {
  private apiUrl = 'statistic'; // Base path for statistic endpoints

  constructor(private http: HttpClient) { }

  getStatistic(type: string): Observable<StatisticResponse> {
    const params = new HttpParams().set('type', type);
    return this.http.get<StatisticResponse>(this.apiUrl, { params });
  }

  getBillStatistic(type: string): Observable<StatisticResult[]> {
    const params = new HttpParams().set('type', type);
    return this.http.get<StatisticResult[]>(`${this.apiUrl}/bills`, { params });
  }
}
