import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverageMapVisualizerModalComponent } from './coverage-map-visualizer-modal.component';

describe('CoverageMapVisualizerModalComponent', () => {
  let component: CoverageMapVisualizerModalComponent;
  let fixture: ComponentFixture<CoverageMapVisualizerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoverageMapVisualizerModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoverageMapVisualizerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
