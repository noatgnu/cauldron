import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiannToCurtainptmModalComponent } from './diann-to-curtainptm-modal.component';

describe('DiannToCurtainptmModalComponent', () => {
  let component: DiannToCurtainptmModalComponent;
  let fixture: ComponentFixture<DiannToCurtainptmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiannToCurtainptmModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DiannToCurtainptmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
