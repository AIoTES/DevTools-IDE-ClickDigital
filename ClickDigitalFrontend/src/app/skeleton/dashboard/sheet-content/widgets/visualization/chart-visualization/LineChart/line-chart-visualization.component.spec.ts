import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartVisualizationComponent } from './line-chart-visualization.component';

describe('LineChartVisualizationComponent', () => {
  let component: LineChartVisualizationComponent;
  let fixture: ComponentFixture<LineChartVisualizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineChartVisualizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
