import { TestBed } from '@angular/core/testing';

import { JoinProject } from './join-project';

describe('JoinProject', () => {
  let service: JoinProject;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JoinProject);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
