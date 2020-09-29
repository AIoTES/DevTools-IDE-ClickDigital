import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimeAnomalyComponent } from './realtime-anomaly.component';

describe('RealtimeAnomalyComponent', () => {
  let component: RealtimeAnomalyComponent;
  let fixture: ComponentFixture<RealtimeAnomalyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RealtimeAnomalyComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealtimeAnomalyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
