import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RSettingsComponent } from './r-settings.component';

describe('RSettingsComponent', () => {
  let component: RSettingsComponent;
  let fixture: ComponentFixture<RSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
