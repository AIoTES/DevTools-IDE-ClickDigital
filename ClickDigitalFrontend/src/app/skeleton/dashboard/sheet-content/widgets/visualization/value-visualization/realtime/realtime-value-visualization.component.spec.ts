import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimeValueVisualizationComponent } from './realtime-value-visualization.component';

describe('RealtimeValueVisualizationComponent', () => {
  let component: RealtimeValueVisualizationComponent;
  let fixture: ComponentFixture<RealtimeValueVisualizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RealtimeValueVisualizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealtimeValueVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
