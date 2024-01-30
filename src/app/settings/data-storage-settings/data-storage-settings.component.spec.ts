import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataStorageSettingsComponent } from './data-storage-settings.component';

describe('DataStorageSettingsComponent', () => {
  let component: DataStorageSettingsComponent;
  let fixture: ComponentFixture<DataStorageSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataStorageSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DataStorageSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
