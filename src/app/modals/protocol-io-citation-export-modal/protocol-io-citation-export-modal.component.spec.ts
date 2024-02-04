import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtocolIoCitationExportModalComponent } from './protocol-io-citation-export-modal.component';

describe('ProtocolIoCitationExportModalComponent', () => {
  let component: ProtocolIoCitationExportModalComponent;
  let fixture: ComponentFixture<ProtocolIoCitationExportModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProtocolIoCitationExportModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProtocolIoCitationExportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
