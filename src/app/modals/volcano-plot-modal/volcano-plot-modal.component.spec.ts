import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolcanoPlotModalComponent } from './volcano-plot-modal.component';

describe('VolcanoPlotModelComponent', () => {
  let component: VolcanoPlotModalComponent;
  let fixture: ComponentFixture<VolcanoPlotModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolcanoPlotModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolcanoPlotModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
