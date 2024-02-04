import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniprotModalComponent } from './uniprot-modal.component';

describe('UniprotModalComponent', () => {
  let component: UniprotModalComponent;
  let fixture: ComponentFixture<UniprotModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniprotModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UniprotModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
