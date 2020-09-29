import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BubbleChartVisualizationComponent } from './bubble-chart-visualization.component';

describe('BubbleChartVisualizationComponent', () => {
  let component: BubbleChartVisualizationComponent;
  let fixture: ComponentFixture<BubbleChartVisualizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BubbleChartVisualizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BubbleChartVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
