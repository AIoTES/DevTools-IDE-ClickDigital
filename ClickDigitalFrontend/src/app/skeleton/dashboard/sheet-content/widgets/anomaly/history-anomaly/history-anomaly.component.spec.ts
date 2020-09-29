
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryAnomalyComponent } from './history-anomaly.component';

describe('HistoryAnomalyComponent', () => {
  let component: HistoryAnomalyComponent;
  let fixture: ComponentFixture<HistoryAnomalyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoryAnomalyComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryAnomalyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
