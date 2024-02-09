import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurtainSettingsComponent } from './curtain-settings.component';

describe('CurtainSettingsComponent', () => {
  let component: CurtainSettingsComponent;
  let fixture: ComponentFixture<CurtainSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurtainSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CurtainSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
