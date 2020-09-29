import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolarAreaChartVisualizationComponent } from './polar-area-chart-visualization.component';

describe('PolarAreaChartVisualizationComponent', () => {
  let component: PolarAreaChartVisualizationComponent;
  let fixture: ComponentFixture<PolarAreaChartVisualizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolarAreaChartVisualizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolarAreaChartVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
