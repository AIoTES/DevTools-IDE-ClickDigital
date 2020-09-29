import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PolicyACPComponent} from './policy-acp.component';

describe('PolicyACPComponent', () => {
  let component: PolicyACPComponent;
  let fixture: ComponentFixture<PolicyACPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyACPComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyACPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
