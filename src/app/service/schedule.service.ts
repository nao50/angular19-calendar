import { Injectable, signal } from '@angular/core';
import { Schedule } from '../model/schedule.model';
import { isSameDay, isWithinInterval } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  schedules = signal<Schedule[]>([]);
  // lastModifiedSchedule = signal<Schedule | null>(null);
  lastModifiedSchedule = signal<{type: 'create' | 'update' | 'delete', schedule: Schedule} | null>(null);

  createSchedule(schedule: Omit<Schedule, 'id'>): void {
    const newSchedule = {
      ...schedule,
      id: crypto.randomUUID().toString()
    };
    this.schedules.update(v => {
      return [...v, newSchedule];
    });
    this.lastModifiedSchedule.set({
      type: 'create',
      schedule: newSchedule
    })
  }

  reCreateSchedule(schedule: Schedule): void {
    this.schedules.update(v => {
      return [...v, schedule];
    });
    this.lastModifiedSchedule.set({
      type: 'create',
      schedule: schedule
    })
  }

  updateSchedule(schedule: Schedule): void {
    const currentSchedule = this.schedules().find(s => s.id === schedule.id);
    if (currentSchedule) {
      this.lastModifiedSchedule.set({
        type: 'update',
        schedule: currentSchedule
      })
    }

    this.schedules.update(values => {
      return values.map(s => {
        return s.id === schedule.id ? schedule : s
      })
    });
  }

  // deleteSchedule(id: string): void {
  deleteSchedule(schedule: Schedule): void {
    const currentSchedule = this.schedules().find(s => s.id === schedule.id);
    if (currentSchedule) {
      this.lastModifiedSchedule.set({
        type: 'delete',
        schedule: currentSchedule
      })
    }

    this.schedules.update(values => {
      return values.filter(s =>  s.id !== schedule.id)
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