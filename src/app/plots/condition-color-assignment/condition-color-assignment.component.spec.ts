import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionColorAssignmentComponent } from './condition-color-assignment.component';

describe('ConditionColorAssignmentComponent', () => {
  let component: ConditionColorAssignmentComponent;
  let fixture: ComponentFixture<ConditionColorAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConditionColorAssignmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConditionColorAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
