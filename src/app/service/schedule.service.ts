import { Injectable, signal } from '@angular/core';
import { Schedule } from '../model/schedule.model';
import { isSameDay, isWithinInterval } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  schedules = signal<Schedule[]>([]);

  addSchedule(schedule: Omit<Schedule, 'id'>): void {
    const newSchedule = {
      ...schedule,
      id: crypto.randomUUID().toString()
    };
    this.schedules.update(v => {
      return [...v, newSchedule];
    });
  }

  updateSchedule(schedule: Schedule): void {
    this.schedules.update(values => {
      return values.map(s => {
        return s.id === schedule.id ? schedule : s
      })
    });
  }

  deleteSchedule(id: string): void {
    this.schedules.update(values => {
      return values.filter(s =>  s.id !== id)
    });
  }

  getSchedulesForDate(date: Date): Schedule[] {
    return this.schedules().filter(schedule => 
      isWithinInterval(date, { 
        start: new Date(schedule.startDate), 
        end: new Date(schedule.endDate) 
      }) ||
      isSameDay(date, schedule.startDate) ||
      isSameDay(date, schedule.endDate)
    );
  }
}