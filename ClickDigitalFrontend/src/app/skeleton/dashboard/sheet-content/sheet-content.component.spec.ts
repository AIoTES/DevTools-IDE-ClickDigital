import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetContentComponent } from './sheet-content.component';

describe('SheetContentComponent', () => {
  let component: SheetContentComponent;
  let fixture: ComponentFixture<SheetContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SheetContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SheetContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
