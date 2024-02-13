import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuzzyClusteringModalComponent } from './fuzzy-clustering-modal.component';

describe('FuzzyClusteringModalComponent', () => {
  let component: FuzzyClusteringModalComponent;
  let fixture: ComponentFixture<FuzzyClusteringModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuzzyClusteringModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FuzzyClusteringModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
