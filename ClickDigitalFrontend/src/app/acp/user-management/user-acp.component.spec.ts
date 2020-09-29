import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {UserACPComponent} from './user-acp.component';

describe('UserACPComponent', () => {
  let component: UserACPComponent;
  let fixture: ComponentFixture<UserACPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserACPComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserACPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
