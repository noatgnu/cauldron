import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcaPlotComponent } from './pca-plot.component';

describe('PcaPlotComponent', () => {
  let component: PcaPlotComponent;
  let fixture: ComponentFixture<PcaPlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PcaPlotComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PcaPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
