import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadExtraDialogComponent } from './download-extra-dialog.component';

describe('DownloadExtraDialogComponent', () => {
  let component: DownloadExtraDialogComponent;
  let fixture: ComponentFixture<DownloadExtraDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadExtraDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadExtraDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
