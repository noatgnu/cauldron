import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlphaPeptStatsDifferentialAnalysisModalComponent } from './alpha-pept-stats-differential-analysis-modal.component';

describe('AlphaPeptStatsDifferentialAnalysisModalComponent', () => {
  let component: AlphaPeptStatsDifferentialAnalysisModalComponent;
  let fixture: ComponentFixture<AlphaPeptStatsDifferentialAnalysisModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlphaPeptStatsDifferentialAnalysisModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlphaPeptStatsDifferentialAnalysisModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
