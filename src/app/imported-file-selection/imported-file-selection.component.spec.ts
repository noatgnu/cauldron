import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportedFileSelectionComponent } from './imported-file-selection.component';

describe('ImportedFileSelectionComponent', () => {
  let component: ImportedFileSelectionComponent;
  let fixture: ComponentFixture<ImportedFileSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportedFileSelectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImportedFileSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
