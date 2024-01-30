import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PythonSettingsComponent } from './python-settings.component';

describe('PythonSettingsComponent', () => {
  let component: PythonSettingsComponent;
  let fixture: ComponentFixture<PythonSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PythonSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PythonSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
