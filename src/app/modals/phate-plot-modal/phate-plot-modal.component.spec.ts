import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhatePlotModalComponent } from './phate-plot-modal.component';

describe('PhatePlotModalComponent', () => {
  let component: PhatePlotModalComponent;
  let fixture: ComponentFixture<PhatePlotModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhatePlotModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PhatePlotModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
