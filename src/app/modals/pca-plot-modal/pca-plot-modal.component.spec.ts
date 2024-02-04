import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcaPlotModalComponent } from './pca-plot-modal.component';

describe('PcaPlotModalComponent', () => {
  let component: PcaPlotModalComponent;
  let fixture: ComponentFixture<PcaPlotModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PcaPlotModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PcaPlotModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
