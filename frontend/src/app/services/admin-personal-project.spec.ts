import { TestBed } from '@angular/core/testing';

import { AdminPersonalProject } from './admin-personal-project';

describe('AdminPersonalProject', () => {
  let service: AdminPersonalProject;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminPersonalProject);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
