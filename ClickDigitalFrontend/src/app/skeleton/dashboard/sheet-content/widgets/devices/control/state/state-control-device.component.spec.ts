import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StateControlDeviceComponent } from './state-control-device.component';

describe('StateControlDeviceComponent', () => {
  let component: StateControlDeviceComponent;
  let fixture: ComponentFixture<StateControlDeviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StateControlDeviceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StateControlDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
