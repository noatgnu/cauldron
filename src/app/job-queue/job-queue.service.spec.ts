import { TestBed } from '@angular/core/testing';

import { JobQueueService } from './job-queue.service';

describe('JobQueueService', () => {
  let service: JobQueueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobQueueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
