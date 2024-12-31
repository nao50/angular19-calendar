export interface Schedule {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
}

export interface MonthlyCalendarSchedulePosition {
  schedule: Schedule;
  column: number;
  columnSpan: number;
  row: number;
  rowSpan: number;
}
