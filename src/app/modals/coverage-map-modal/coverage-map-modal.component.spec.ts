import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverageMapModalComponent } from './coverage-map-modal.component';

describe('CoverageMapModalComponent', () => {
  let component: CoverageMapModalComponent;
  let fixture: ComponentFixture<CoverageMapModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoverageMapModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoverageMapModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
