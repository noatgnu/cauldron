import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuzzyClusteringPlotModalComponent } from './fuzzy-clustering-plot-modal.component';

describe('FuzzyClusteringPlotModalComponent', () => {
  let component: FuzzyClusteringPlotModalComponent;
  let fixture: ComponentFixture<FuzzyClusteringPlotModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuzzyClusteringPlotModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FuzzyClusteringPlotModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
