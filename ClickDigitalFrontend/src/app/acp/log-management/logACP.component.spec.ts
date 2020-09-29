import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LogACPComponent} from './logACP.component';

describe('LogACPComponent', () => {
  let component: LogACPComponent;
  let fixture: ComponentFixture<LogACPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LogACPComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogACPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
