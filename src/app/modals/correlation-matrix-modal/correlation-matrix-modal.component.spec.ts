import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrelationMatrixModalComponent } from './correlation-matrix-modal.component';

describe('CorrelationMatrixComponent', () => {
  let component: CorrelationMatrixModalComponent;
  let fixture: ComponentFixture<CorrelationMatrixModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorrelationMatrixModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorrelationMatrixModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
