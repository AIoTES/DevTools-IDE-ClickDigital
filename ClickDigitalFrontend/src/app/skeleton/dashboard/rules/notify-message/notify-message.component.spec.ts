import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotifyMessageComponent } from './notify-message.component';

describe('NotifyMessageComponent', () => {
  let component: NotifyMessageComponent;
  let fixture: ComponentFixture<NotifyMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotifyMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotifyMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
