import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePlotModalComponent } from './profile-plot-modal.component';

describe('ProfilePlotModalComponent', () => {
  let component: ProfilePlotModalComponent;
  let fixture: ComponentFixture<ProfilePlotModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePlotModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfilePlotModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
