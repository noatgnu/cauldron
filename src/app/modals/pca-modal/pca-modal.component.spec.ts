import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcaModalComponent } from './pca-modal.component';

describe('PcaModalComponent', () => {
  let component: PcaModalComponent;
  let fixture: ComponentFixture<PcaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PcaModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PcaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
