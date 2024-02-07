import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobRemovalModalComponent } from './job-removal-modal.component';

describe('JobRemovalModalComponent', () => {
  let component: JobRemovalModalComponent;
  let fixture: ComponentFixture<JobRemovalModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobRemovalModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JobRemovalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
