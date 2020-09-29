import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleControlDeviceComponent } from './toggle-control-device.component';

describe('StateControlDeviceComponent', () => {
  let component: ToggleControlDeviceComponent;
  let fixture: ComponentFixture<ToggleControlDeviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToggleControlDeviceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToggleControlDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
