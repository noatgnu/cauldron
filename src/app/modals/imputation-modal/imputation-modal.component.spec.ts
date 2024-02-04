import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImputationModalComponent } from './imputation-modal.component';

describe('ImputationModalComponent', () => {
  let component: ImputationModalComponent;
  let fixture: ComponentFixture<ImputationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImputationModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImputationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
