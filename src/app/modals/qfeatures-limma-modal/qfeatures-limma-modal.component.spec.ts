import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QfeaturesLimmaModalComponent } from './qfeatures-limma-modal.component';

describe('QfeaturesLimmaModalComponent', () => {
  let component: QfeaturesLimmaModalComponent;
  let fixture: ComponentFixture<QfeaturesLimmaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QfeaturesLimmaModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QfeaturesLimmaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
