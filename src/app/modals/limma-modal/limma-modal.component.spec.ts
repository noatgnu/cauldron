import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimmaModalComponent } from './limma-modal.component';

describe('QfeaturesLimmaModalComponent', () => {
  let component: LimmaModalComponent;
  let fixture: ComponentFixture<LimmaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LimmaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LimmaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
