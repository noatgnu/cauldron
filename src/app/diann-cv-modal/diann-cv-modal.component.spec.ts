import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiannCvModalComponent } from './diann-cv-modal.component';

describe('DiannCvModalComponent', () => {
  let component: DiannCvModalComponent;
  let fixture: ComponentFixture<DiannCvModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiannCvModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DiannCvModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
