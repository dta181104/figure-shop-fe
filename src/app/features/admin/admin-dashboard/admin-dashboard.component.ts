import { Component, OnInit, inject, ViewChild, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import {
  NgApexchartsModule,
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexYAxis,
  ApexDataLabels,
  ApexStroke,
} from 'ng-apexcharts';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageService } from 'ng-zorro-antd/message';

import { StatisticService } from '@/app/core/services/statistic.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels;
  colors?: string[];
  stroke?: ApexStroke;
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule,
    NzSelectModule,
    NzCardModule,
    NzSpinModule,
    NzGridModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  private statisticService = inject(StatisticService);
  private message = inject(NzMessageService);

  isBrowser = false;

  totalUsers = 0;
  totalProducts = 0;
  isGeneralLoading = false;
  isChartLoading = false;
  dashboardError = '';

  selectedTimeFrame = 'STATISTIC_BILL_90_DAYS';
  timeFrames = [
    { value: 'STATISTIC_BILL_90_DAYS', label: '90 ngày qua' },
    { value: 'STATISTIC_BILL_6_MONTHS', label: '6 tháng qua' },
    { value: 'STATISTIC_BILL_3_YEARS', label: '3 năm qua' },
  ];

  public orderChartOptions: ChartOptions;
  public revenueChartOptions: ChartOptions;

  constructor() {
    afterNextRender(() => {
      this.isBrowser = true;
    });
    
    this.orderChartOptions = {
      series: [],
      chart: {
        height: 250,
        type: 'line',
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: 'inherit',
      },
      colors: ['#1890ff'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      title: {
        text: 'Biểu đồ Số lượng đơn hàng',
        align: 'left',
        style: {
          color: '#fffff',
          fontWeight: 'normal',
          fontSize: '20px',
        },
      },
      xaxis: { categories: [] },
      yaxis: {
        title: {
          text: 'Số đơn',
          style: {
            color: '#fffff',
            fontWeight: 'normal',
            fontSize: '16px',
          },
        },
        decimalsInFloat: 0, // Khai báo không lấy số thập phân
        labels: {
          formatter: (val) => {
            // Chỉ hiển thị các mốc là số nguyên
            return val % 1 === 0 ? val.toString() : '';
          },
        },
      },
    };

    this.revenueChartOptions = {
      series: [],
      chart: { height: 250, type: 'bar', toolbar: { show: false }, zoom: { enabled: false } },
      colors: ['#52c41a'],
      dataLabels: { enabled: false },
      title: {
        text: 'Biểu đồ Doanh thu',
        align: 'left',
        style: {
          color: '#fffff',
          fontWeight: 'normal',
          fontSize: '20px',
        },
      },
      xaxis: { categories: [] },
      yaxis: {
        title: { text: 'VNĐ', style: { color: '#fffff', fontWeight: 'normal', fontSize: '16px' } },
        decimalsInFloat: 0,
        labels: { formatter: (val) => val.toLocaleString() },
      },
    };
  }

  ngOnInit(): void {
    this.loadGeneralStatistics();
    this.loadBillStatistics();
  }

  loadGeneralStatistics(): void {
    this.isGeneralLoading = true;
    forkJoin({
      userStats: this.statisticService.getStatistic('USER'),
      productStats: this.statisticService.getStatistic('PRODUCT'),
    })
      .pipe(finalize(() => (this.isGeneralLoading = false)))
      .subscribe({
        next: (res: any) => {
          this.totalUsers = res.userStats?.result?.totalUsers || res.userStats?.totalUsers || 0;
          this.totalProducts =
            res.productStats?.result?.totalProducts || res.productStats?.totalProducts || 0;
        },
        error: (err) => {
          this.dashboardError = 'Không tải được số liệu tổng quan.';
          this.message.error(this.dashboardError);
        },
      });
  }

  loadBillStatistics(): void {
    this.isChartLoading = true;
    this.statisticService
      .getBillStatistic(this.selectedTimeFrame)
      .pipe(finalize(() => (this.isChartLoading = false)))
      .subscribe({
        next: (res: any) => {
          const dataList = res?.result || res || [];
          const times = dataList.map((item: any) => item.time);
          const revenues = dataList.map((item: any) => item.revenue);
          const bills = dataList.map((item: any) => item.totalBills);

          // Cập nhật biểu đồ Đơn hàng
          this.orderChartOptions.xaxis = { ...this.orderChartOptions.xaxis, categories: times };
          this.orderChartOptions.series = [{ name: 'Đơn hàng', data: bills }];

          // Cập nhật biểu đồ Doanh thu
          this.revenueChartOptions.xaxis = { ...this.revenueChartOptions.xaxis, categories: times };
          this.revenueChartOptions.series = [{ name: 'Doanh thu', data: revenues }];
        },
        error: (err) => {
          this.message.error('Không tải được dữ liệu biểu đồ.');
        },
      });
  }

  onTimeFrameChange(): void {
    this.loadBillStatistics();
  }
}
