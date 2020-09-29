import { inject, TestBed } from '@angular/core/testing';

import { DataPrivacyManagerService } from './dataprivacymanager.service';

describe('DataPrivacyManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataPrivacyManagerService]
    });
  });

  it('should be created', inject([DataPrivacyManagerService], (service: DataPrivacyManagerService) => {
    expect(service).toBeTruthy();
  }));
});
