import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckPeptideInLibraryModalComponent } from './check-peptide-in-library-modal.component';

describe('CheckPeptideInLibraryModalComponent', () => {
  let component: CheckPeptideInLibraryModalComponent;
  let fixture: ComponentFixture<CheckPeptideInLibraryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckPeptideInLibraryModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CheckPeptideInLibraryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
