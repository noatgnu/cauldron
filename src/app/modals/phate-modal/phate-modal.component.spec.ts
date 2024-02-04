import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhateModalComponent } from './phate-modal.component';

describe('PhateModalComponent', () => {
  let component: PhateModalComponent;
  let fixture: ComponentFixture<PhateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhateModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PhateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
