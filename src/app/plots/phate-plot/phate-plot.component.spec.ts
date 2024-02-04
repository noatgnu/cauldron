import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhatePlotComponent } from './phate-plot.component';

describe('PhatePlotComponent', () => {
  let component: PhatePlotComponent;
  let fixture: ComponentFixture<PhatePlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhatePlotComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PhatePlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
