import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ACPComponent} from './acp.component';

describe('ACPComponent', () => {
  let component: ACPComponent;
  let fixture: ComponentFixture<ACPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ACPComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ACPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
