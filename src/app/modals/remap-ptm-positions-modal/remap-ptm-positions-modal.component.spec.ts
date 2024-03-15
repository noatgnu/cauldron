import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemapPtmPositionsModalComponent } from './remap-ptm-positions-modal.component';

describe('RemapPtmPositionsModalComponent', () => {
  let component: RemapPtmPositionsModalComponent;
  let fixture: ComponentFixture<RemapPtmPositionsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemapPtmPositionsModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RemapPtmPositionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
