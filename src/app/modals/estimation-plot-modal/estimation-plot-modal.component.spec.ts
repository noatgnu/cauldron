import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimationPlotModalComponent } from './estimation-plot-modal.component';

describe('EstimationPlotModalComponent', () => {
  let component: EstimationPlotModalComponent;
  let fixture: ComponentFixture<EstimationPlotModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstimationPlotModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstimationPlotModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
