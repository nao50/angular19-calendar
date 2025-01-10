import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleEditNotificationComponent } from './schedule-edit-notification.component';

describe('ScheduleEditNotificationComponent', () => {
  let component: ScheduleEditNotificationComponent;
  let fixture: ComponentFixture<ScheduleEditNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleEditNotificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleEditNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
