export interface DashboardStats {
  studentsCount?: number;
  totalStudents?: number;
  allocatedBeds?: number;
  availableBeds?: number;
  totalRooms?: number;
  unpaidBillsCount?: number;
  totalUnpaidAmount?: number;
  totalPaidAmount?: number;
  activeFlags?: number;
  breakfast?: number;
  lunch?: number;
  dinner?: number;
  outingsActive?: number;
  totalDue?: number;
  totalPaid?: number;
  stu?: any;
  bed?: any;
  [key: string]: any;
}

export interface AttendanceChartItem {
  name: string;
  count: number;
  color: string;
}

export interface OccupancyChartItem {
  name: string;
  value: number;
  color: string;
}
