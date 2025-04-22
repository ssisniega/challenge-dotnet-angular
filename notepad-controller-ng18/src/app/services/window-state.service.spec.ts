import { TestBed } from '@angular/core/testing';

import { WindowStateService } from './window-state.service';

describe('WindowStateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WindowStateService = TestBed.get(WindowStateService);
    expect(service).toBeTruthy();
  });
});
