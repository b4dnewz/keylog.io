import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HostnamesListComponent } from './hostnames-list.component';

describe('HostnamesListComponent', () => {
  let component: HostnamesListComponent;
  let fixture: ComponentFixture<HostnamesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HostnamesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HostnamesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
