import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderControlDeviceComponent } from './slider-control-device.component';

describe('StateControlDeviceComponent', () => {
  let component: SliderControlDeviceComponent;
  let fixture: ComponentFixture<SliderControlDeviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SliderControlDeviceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderControlDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
