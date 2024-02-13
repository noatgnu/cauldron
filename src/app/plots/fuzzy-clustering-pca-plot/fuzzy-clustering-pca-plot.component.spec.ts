import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuzzyClusteringPcaPlotComponent } from './fuzzy-clustering-pca-plot.component';

describe('FuzzyClusteringPcaPlotComponent', () => {
  let component: FuzzyClusteringPcaPlotComponent;
  let fixture: ComponentFixture<FuzzyClusteringPcaPlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuzzyClusteringPcaPlotComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FuzzyClusteringPcaPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
