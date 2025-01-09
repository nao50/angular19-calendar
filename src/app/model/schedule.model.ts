export interface Schedule {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
}

export interface MonthlyCalendarSchedulePosition {
  schedule: Schedule;
  startOffset: number;  // 週の開始からのオフセット（日数）
  duration: number;     // この週での表示日数
  row: number;         // 縦位置
  isHiddenByDisplaySize: boolean;
}