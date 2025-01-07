# Angular19Calendar

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## bolt 
Angular19とtailwindでカレンダーアプリの開発を行っています。
まずは現状のコードを紹介します。
tsファイル内にhtmlを書いていますが、実際にはhtmlファイルに分かれています。

cssとしては全てtailwindで書き、flexを使わずgridで実現します。

現状 `<app-month-calendar />` 内に日を跨ぐ `<app-schedule />` があった場合、各日付ごとのgridに別々の（複数の）`<app-schedule />` が表示されますが、Googleカレンダーのように日を跨ぐ `<app-schedule />` を各日付ごとのgridに跨って1つの `<app-schedule />` として表示するように変更してください。（週を跨ぐ場合は1つの`<app-schedule />`では表現できないので週ごとに 1つの `<app-schedule />` としてください。）

不足している情報があればお知らせください。


```sh
$ tree -L 5 -I node_modules
.
├── README.md
├── angular.json
├── package-lock.json
├── package.json
├── public
│   └── favicon.ico
├── src
│   ├── app
│   │   ├── app.component.css
│   │   ├── app.component.html
│   │   ├── app.component.spec.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── calendar
│   │   │   ├── calendar-header
│   │   │   │   ├── calendar-header.component.css
│   │   │   │   ├── calendar-header.component.html
│   │   │   │   ├── calendar-header.component.spec.ts
│   │   │   │   └── calendar-header.component.ts
│   │   │   ├── calendar.component.css
│   │   │   ├── calendar.component.html
│   │   │   ├── calendar.component.spec.ts
│   │   │   ├── calendar.component.ts
│   │   │   ├── day-calendar
│   │   │   │   ├── day-calendar.component.css
│   │   │   │   ├── day-calendar.component.html
│   │   │   │   ├── day-calendar.component.spec.ts
│   │   │   │   └── day-calendar.component.ts
│   │   │   ├── event-modal
│   │   │   │   ├── event-modal.component.css
│   │   │   │   ├── event-modal.component.html
│   │   │   │   ├── event-modal.component.spec.ts
│   │   │   │   └── event-modal.component.ts
│   │   │   ├── month-calendar
│   │   │   │   ├── month-calendar.component.css
│   │   │   │   ├── month-calendar.component.html
│   │   │   │   ├── month-calendar.component.spec.ts
│   │   │   │   └── month-calendar.component.ts
│   │   │   ├── schedule
│   │   │   │   ├── schedule.component.css
│   │   │   │   ├── schedule.component.html
│   │   │   │   ├── schedule.component.spec.ts
│   │   │   │   └── schedule.component.ts
│   │   │   └── week-calendar
│   │   │       ├── week-calendar.component.css
│   │   │       ├── week-calendar.component.html
│   │   │       ├── week-calendar.component.spec.ts
│   │   │       └── week-calendar.component.ts
│   │   ├── model
│   │   │   ├── calendar.model.ts
│   │   │   └── schedule.model.ts
│   │   ├── service
│   │   │   └── schedule.service.ts
│   │   └── util
│   │       ├── calendar.util.ts
│   │       └── date.util.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json

13 directories, 51 files
```

```ts:calendar.component.ts
import { Component, inject, computed, output } from '@angular/core';
import { CalendarHeaderComponent } from './calendar-header/calendar-header.component';
import { MonthCalendarComponent } from './month-calendar/month-calendar.component';
import { WeekCalendarComponent } from './week-calendar/week-calendar.component';
import { EventModalComponent } from './event-modal/event-modal.component';
import { ScheduleService } from '../service/schedule.service';
import { CalendarViewMode } from '../model/calendar.model';
import { Schedule } from '../model/schedule.model';
import { generateCalendarDays } from '../util/date.util';
import { getWeekDays } from '../util/calendar.util';

import { 
  addDays,
  addWeeks,
  addMonths,
} from 'date-fns';

@Component({
  selector: 'app-calendar',
  imports: [CalendarHeaderComponent, MonthCalendarComponent, WeekCalendarComponent, EventModalComponent],
  template: `
<div class="h-screen grid grid-rows-[auto_1fr] gap-4 p-4">
  <app-calendar-header
    [currentDate]="currentDate"
    [viewMode]="currentViewMode"
    (viewModeChange)="changeViewMode($event)"
    (previous)="navigatePrevious()"
    (next)="navigateNext()"
    (today)="goToToday()"
  />

  <div class="overflow-auto">
    @switch (currentViewMode) { @case ('Month') {
    <app-month-calendar
      [currentDate]="currentDate"
      [daysDisplayedWithinMonth]="calendarDays"
      [schedules]="schedules()"
      (createSchedule)="openModal($event)"
      (editSchedule)="editSchedule($event)"
    />
    } @case ('Week') {
    <app-week-calendar
      [daysDisplayedWithinMonth]="calendarDays"
      [schedules]="schedules()"
      (createSchedule)="openModal($event)"
      (editSchedule)="editSchedule($event)"
    />
    } }
  </div>

  @if (showModal) {
  <app-event-modal
    [selectedDate]="selectedDate!"
    [editingSchedule]="editingSchedule"
    (closeModal)="closeModal()"
    (saveSchedule)="saveSchedule($event)"
    (deleteSchedule)="deleteSchedule($event)"
  />
  }
</div>
`
})
export class CalendarComponent {
  scheduleService = inject(ScheduleService);
  schedules = computed(() => this.scheduleService.schedules());
  currentDate = new Date();
  currentViewMode: CalendarViewMode = 'Month';
  calendarDays: Date[] = [];
  showModal = false;
  selectedDate: Date | null = null;
  editingSchedule: Schedule | undefined = undefined;

  ngOnInit() {
    this.generateDays();
  }

  changeViewMode(view: CalendarViewMode) {
    this.currentViewMode = view;
    this.generateDays();
  }

  generateDays() {
    switch (this.currentViewMode) {
      case 'Month':
        this.calendarDays = generateCalendarDays(this.currentDate);
        break;
      case 'Week':
        this.calendarDays = getWeekDays(this.currentDate);
        break;
      // case 'Day':
      //   this.calendarDays = [this.currentDate];
      //   break;
    }
  }

  navigatePrevious() {
    switch (this.currentViewMode) {
      case 'Month':
        this.currentDate = addMonths(this.currentDate, -1);
        break;
      case 'Week':
        this.currentDate = addWeeks(this.currentDate, -1);
        break;
      case 'Day':
        this.currentDate = addDays(this.currentDate, -1);
        break;
    }
    this.generateDays();
  }

  navigateNext() {
    switch (this.currentViewMode) {
      case 'Month':
        this.currentDate = addMonths(this.currentDate, 1);
        break;
      case 'Week':
        this.currentDate = addWeeks(this.currentDate, 1);
        break;
      case 'Day':
        this.currentDate = addDays(this.currentDate, 1);
        break;
    }
    this.generateDays();
  }

  goToToday() {
    this.currentDate = new Date();
    this.generateDays();
  }

  openModal(date: Date) {
    this.selectedDate = date;
    this.editingSchedule = undefined;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedDate = null;
    this.editingSchedule = undefined;
  }

  saveSchedule(schedule: Omit<Schedule, 'id'>) {
    if (this.editingSchedule) {
      this.scheduleService.updateSchedule({
        ...this.editingSchedule,
        ...schedule
      });
    } else if (this.selectedDate) {
      this.scheduleService.addSchedule(schedule);
    }
    this.closeModal();
  }

  editSchedule(schedule: Schedule) {
    this.selectedDate = new Date(schedule.startDate);
    this.editingSchedule = schedule;
    this.showModal = true;
  }

  deleteSchedule(schedule: Schedule) {
    this.scheduleService.deleteSchedule(schedule.id);
    this.closeModal();
  }

  getSchedulesForDay(date: Date, hour: string): Schedule[] {
    const [hourStr] = hour.split(':');
    const startTime = new Date(date);
    startTime.setHours(parseInt(hourStr, 10), 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);

    return this.scheduleService.getSchedulesForDate(date)
      .filter(schedule => {
        const start = new Date(schedule.startDate);
        return start >= startTime && start < endTime;
      });
  }
}
```

```ts:calendar-header.component.ts
import { Component, input, output } from '@angular/core';
import { formatDate } from '../../util/date.util';
import { CalendarViewMode } from '../../model/calendar.model';

@Component({
  selector: 'app-calendar-header',
  imports: [],
  template: `
<div class="grid grid-cols-[1fr_auto_auto] gap-4 items-center pb-4 mb-4">
  <h1 class="text-xl font-semibold text-gray-900">
    {{ formatDate(currentDate(), viewTitleFormat) }}
  </h1>

  <div class="grid grid-flow-col gap-1 bg-gray-100 p-1 rounded-lg">
    @for (v of views; track v) {
    <button
      (click)="viewModeChange.emit(v)"
      [class.bg-white]="viewMode() === v"
      [class.shadow]="viewMode() === v"
      class="px-3 py-1.5 text-sm font-medium rounded-md"
    >
      {{ v }}
    </button>
    }
  </div>

  <div class="grid grid-flow-col gap-1">
    <button
      (click)="previous.emit()"
      class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
    >
      ◀
    </button>
    <button
      (click)="today.emit()"
      class="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
    >
      今日
    </button>
    <button
      (click)="next.emit()"
      class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
    >
      ▶
    </button>
  </div>
</div>
`
})
export class CalendarHeaderComponent {
  currentDate = input.required<Date>();
  viewMode = input.required<CalendarViewMode>();
  viewModeChange = output<CalendarViewMode>();
  previous = output<void>();
  next = output<void>();
  today = output<void>();

  views: CalendarViewMode[] = ['Month', 'Week', 'Day'];
  formatDate = formatDate;

  get viewTitleFormat(): string {
    switch (this.viewMode()) {
      case 'Month':
        return 'yyyy年MM月';
      case 'Week':
        return 'yyyy年MM月dd日 週';
      case 'Day':
        return 'yyyy年MM月dd日(E)';
    }
  }
}
```

```ts:event-modal.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Schedule } from '../../model/schedule.model';
import { formatDate } from '../../util/date.util';

@Component({
  selector: 'app-event-modal',
  imports: [CommonModule, FormsModule],
  template: `
  <div
  class="fixed inset-0 bg-black bg-opacity-50 grid place-items-center z-20"
  (click)="onBackdropClick($event)"
>
  <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md grid gap-4">
    <div class="grid grid-cols-[1fr_auto] items-center">
      <h2 class="text-xl font-medium text-gray-900">
        {{ formatDate(selectedDate(), "yyyy年MM月dd日(E)") }}
      </h2>
      @if (editingSchedule()) {
      <button
        type="button"
        (click)="onDelete()"
        class="text-red-500 hover:text-red-700"
      >
        削除
      </button>
      }
    </div>
    <form (submit)="onSubmit($event)" class="grid gap-4">
      <div class="grid gap-1">
        <label class="text-sm font-medium text-gray-700">タイトル</label>
        <input
          type="text"
          [(ngModel)]="title"
          name="title"
          class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          autofocus
        />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="grid gap-1">
          <label class="text-sm font-medium text-gray-700">開始日時</label>
          <input
            type="datetime-local"
            [(ngModel)]="startDate"
            name="startDate"
            class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-medium text-gray-700">終了日時</label>
          <input
            type="datetime-local"
            [(ngModel)]="endDate"
            name="endDate"
            class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>
      <div class="grid gap-1">
        <label class="text-sm font-medium text-gray-700">詳細</label>
        <textarea
          [(ngModel)]="description"
          name="description"
          rows="3"
          class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        ></textarea>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          (click)="closeModal.emit()"
          class="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
        >
          キャンセル
        </button>
        <button
          type="submit"
          class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          {{ editingSchedule() ? "更新" : "保存" }}
        </button>
      </div>
    </form>
  </div>
</div>
`
})
export class EventModalComponent {
  selectedDate = input.required<Date>();
  editingSchedule = input<Schedule>();
  closeModal = output<void>();
  saveSchedule = output<Omit<Schedule, 'id'>>();
  deleteSchedule = output<Schedule>();

  title = '';
  description = '';
  startDate = '';
  endDate = '';
  formatDate = formatDate;

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  ngOnInit() {
    const defaultTime = new Date(this.selectedDate());
    
    if (this.editingSchedule()) {
      this.title = this.editingSchedule()!.title;
      this.description = this.editingSchedule()!.description;
      this.startDate = this.formatDateTimeLocal(this.editingSchedule()!.startDate);
      this.endDate = this.formatDateTimeLocal(this.editingSchedule()!.endDate);
    } else {
      this.startDate = this.formatDateTimeLocal(defaultTime);
      defaultTime.setHours(defaultTime.getHours() + 1);
      this.endDate = this.formatDateTimeLocal(defaultTime);
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal.emit();
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.saveSchedule.emit({
      title: this.title,
      description: this.description,
      startDate: new Date(this.startDate),
      endDate: new Date(this.endDate)
    });
    this.title = '';
    this.description = '';
  }

  onDelete() {
    if (this.editingSchedule()) {
      // this.deleteEvent.emit();
      // this.closeModal.emit();
    }
  }

}
```

```ts:month-calendar.component.ts
import { Component, ViewChild, ElementRef, AfterViewInit, input, output, signal, effect } from '@angular/core';
import { ScheduleComponent } from '../schedule/schedule.component';
import { getCalendarWeeksCount, calculateSchedulePositions } from '../../util/calendar.util';
import { formatDate } from '../../util/date.util';
import { Schedule, MonthlyCalendarSchedulePosition } from '../../model/schedule.model';
import { isSameMonth, isToday } from 'date-fns';

@Component({
  selector: 'app-month-calendar',
  imports: [ScheduleComponent],
  template: `
  <div class="h-full grid grid-rows-[auto_1fr]">
  <div class="grid grid-cols-7">
    @for (dayOfWeek of dayOfWeeks; track dayOfWeek) {
    <div
      class="text-sm font-medium border-[0.5px] text-gray-500 p-2 text-center bg-gray-50"
    >
      {{ dayOfWeek }}
    </div>
    }
  </div>

  <div [class]="gridRowsClass" #calendarGrid>
    @for (day of daysDisplayedWithinMonth(); track day) {
    <div
      [class.bg-gray-50]="!isSameMonth(day, currentDate())"
      [class.text-gray-400]="!isSameMonth(day, currentDate())"
      [class.bg-blue-50]="isToday(day)"
      class="border p-1 h-full grid grid-rows-[auto_1fr] cursor-pointer"
      (click)="createSchedule.emit(day)"
    >
      <div class="text-sm font-medium">{{ formatDate(day, "d") }}</div>

      <div class="relative min-h-0">
        <div class="absolute inset-0 overflow-hidden">
          <div class="">
            @for (schedule of getVisibleSchedules(day); track
            schedule.schedule.id) {
            <app-schedule
              [schedule]="schedule.schedule"
              (editSchedule)="editSchedule.emit(schedule.schedule)"
              class="block min-h-[1.75rem] sm:min-h-[2rem] lg:min-h-[2.5rem]"
            />
            } @if (hasHiddenSchedules(day)) {
            <div class="text-xs text-gray-500 px-2 py-0.5">
              他 {{ getHiddenSchedulesCount(day) }} 件...
            </div>
            }
          </div>
        </div>
      </div>
    </div>
    }
  </div>
</div>
  `
})
export class MonthCalendarComponent implements AfterViewInit {
  dayOfWeeks = ['日', '月', '火', '水', '木', '金', '土'];
  currentDate = input.required<Date>();
  daysDisplayedWithinMonth = input<Date[]>([]);
  schedules = input<Schedule[]>();
  createSchedule = output<Date>();
  editSchedule = output<Schedule>();

  //
  @ViewChild('calendarGrid') calendarGrid!: ElementRef;
  private cellHeight = signal(0);
  private maxVisibleSchedules = signal(0);

  formatDate = formatDate;
  isSameMonth = isSameMonth;
  isToday = isToday;

  constructor() {
    // cellHeightが変更されたら自動的にmaxVisibleSchedulesを再計算
    effect(() => {
      const height = this.cellHeight();
      const dateHeight = 24; // 日付部分の高さ
      const scheduleHeight = 40; // スケジュール1件の高さ
      const moreTextHeight = 20; // 「他 X 件...」の高さ
      const scheduleGap = 0; // スケジュール間のギャップ

      const availableHeight = height - dateHeight - moreTextHeight;
      const scheduleWithGapHeight = scheduleHeight + scheduleGap;
      
      this.maxVisibleSchedules.set(Math.max(1, Math.floor(availableHeight / scheduleWithGapHeight)));
    });
  }

  ngAfterViewInit() {
    this.updateCellHeight();
    this.setupResizeObserver();
  }

  private updateCellHeight() {
    const gridCells = this.calendarGrid.nativeElement.children;
    if (gridCells.length > 0) {
      this.cellHeight.set(gridCells[0].clientHeight);
    }
  }

  private setupResizeObserver() {
    const resizeObserver = new ResizeObserver(() => {
      this.updateCellHeight();
    });
    
    resizeObserver.observe(this.calendarGrid.nativeElement);
  }

  getVisibleSchedules(date: Date): MonthlyCalendarSchedulePosition[] {
    const positions = this.getPositionsForDay(date);
    return positions.slice(0, this.maxVisibleSchedules());
  }

  hasHiddenSchedules(date: Date): boolean {
    return this.getPositionsForDay(date).length > this.maxVisibleSchedules();
  }

  getHiddenSchedulesCount(date: Date): number {
    return this.getPositionsForDay(date).length - this.maxVisibleSchedules();
  }

  //
  get gridRowsClass(): string {
    const weeksCount = getCalendarWeeksCount(this.currentDate());
    return `grid grid-cols-7 grid-rows-${weeksCount - 1} border`;
  }

  getPositionsForDay(date: Date): MonthlyCalendarSchedulePosition[] {
    return calculateSchedulePositions(
      this.schedules() || [],
      date,
    );
  }
}
```

```ts:schedule.component.ts
import { Component, input, output } from '@angular/core';
import { Schedule } from '../../model/schedule.model';
import { formatDate, isSameDay } from '../../util/date.util';

@Component({
  selector: 'app-schedule',
  imports: [],
  template: `
  <div
  class="group relative bg-blue-50 border-l-4 border-blue-500 px-2 py-1 rounded-r text-sm hover:bg-blue-100 h-full"
  (click)="editSchedule.emit(schedule()); $event.stopPropagation()"
>
  <div class="grid gap-0.5">
    <div class="grid grid-cols-[auto_1fr] gap-1 items-center">
      <span class="text-xs text-gray-600 whitespace-nowrap">
        {{ formatDate(schedule().startDate, "HH:mm") }}
      </span>
      <span class="truncate font-medium">{{ schedule().title }}</span>
    </div>
    @if (isMultiDay) {
    <span class="text-xs text-gray-500 truncate">
      {{ formatDate(schedule().endDate, "M/d HH:mm") }}まで
    </span>
    }
  </div>
</div>
  `
})
export class ScheduleComponent {
  schedule = input.required<Schedule>();
  editSchedule = output<Schedule>();

  formatDate = formatDate;

  get isMultiDay(): boolean {
    return !isSameDay(this.schedule().startDate, this.schedule().endDate);
  }

  handleClick(event: Event): void {
    event.stopPropagation()
    this.editSchedule.emit(this.schedule());
  }
}
```

```ts:model/schedule.model.ts
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
```

```ts:model/calendar.model.ts
export type CalendarViewMode = 'Month' | 'Week' | 'Day';
```

```ts:util/calendar.util.ts
import { Schedule, MonthlyCalendarSchedulePosition } from '../model/schedule.model'; 
import {
  startOfWeek,
  endOfWeek,
  endOfMonth,
  startOfMonth,
  isSameDay,
  isWithinInterval,
  differenceInDays,
  eachDayOfInterval,
  differenceInMinutes,
} from 'date-fns';

export const getWeekDays = (date: Date): Date[] => {
  return eachDayOfInterval({
    start: startOfWeek(date, { weekStartsOn: 0 }),
    end: endOfWeek(date, { weekStartsOn: 0 })
  });
}

export const getCalendarWeeksCount = (date: Date): number => {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
  return Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
}

export const calculateSchedulePositions = (
  schedules: Schedule[],
  currentDate: Date,
): MonthlyCalendarSchedulePosition[] => {
  return schedules
    .filter(schedule => {
      const start = new Date(schedule.startDate);
      const end = new Date(schedule.endDate);
      return isWithinInterval(currentDate, { start, end }) || 
             isSameDay(currentDate, start) || 
             isSameDay(currentDate, end);
    })
    .map(schedule => ({
      schedule,
      column: 0,
      columnSpan: 1,
      row: 0,
      rowSpan: 1
    }));
}

export const getEventsForDay = (date: Date, events: Schedule[]): Schedule[] => {
  return events.filter(event => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return isWithinInterval(date, { start, end }) || 
           isSameDay(date, start) || 
           isSameDay(date, end);
  });
}

export const calculateSchedulePositionsForWeeklyCalender
  = (event: Schedule, hourHeight: number = 56): { 
    top: string;
    height: string;
  } => {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  
  const minutesFromStartOfDay = start.getHours() * 60 + start.getMinutes();
  const duration = differenceInMinutes(end, start);
  
  const top = (minutesFromStartOfDay / 60) * hourHeight;
  const height = (duration / 60) * hourHeight;
  
  return {
    top: `${top}px`,
    height: `${height}px`
  };
}
```

```ts:util/date.util.ts
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale';

export const formatDate = (date: Date, formatStr: string): string => {
  return format(date, formatStr, { locale: ja });
};

export const generateCalendarDays = (currentDate: Date): Date[] => {
  const start = startOfWeek(startOfMonth(currentDate));
  const end = endOfWeek(endOfMonth(currentDate));
  return eachDayOfInterval({ start, end });
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}
```

```ts:schedule.service.ts
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
```