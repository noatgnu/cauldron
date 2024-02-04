import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsfraggerToCurtainptmModalComponent } from './msfragger-to-curtainptm-modal.component';

describe('MsfraggerToCurtainptmModalComponent', () => {
  let component: MsfraggerToCurtainptmModalComponent;
  let fixture: ComponentFixture<MsfraggerToCurtainptmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MsfraggerToCurtainptmModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MsfraggerToCurtainptmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
