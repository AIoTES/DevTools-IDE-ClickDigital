import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPrivacySettingsComponent } from './user-privacy-settings.component';

describe('UserSettingsComponent', () => {
  let component: UserPrivacySettingsComponent;
  let fixture: ComponentFixture<UserPrivacySettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserPrivacySettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPrivacySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
