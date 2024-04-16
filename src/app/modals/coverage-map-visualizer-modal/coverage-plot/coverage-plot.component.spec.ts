import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoveragePlotComponent } from './coverage-plot.component';

describe('CoveragePlotComponent', () => {
  let component: CoveragePlotComponent;
  let fixture: ComponentFixture<CoveragePlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoveragePlotComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoveragePlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
