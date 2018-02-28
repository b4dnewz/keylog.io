import { Component, Input, Output, EventEmitter, ViewChild, IterableDiffers } from '@angular/core';

@Component({
  selector: 'app-hostnames-list',
  templateUrl: './hostnames-list.component.html',
  styleUrls: ['./hostnames-list.component.css']
})

export class HostnamesListComponent {

  // Multiple selection checkbox group
  @ViewChild('channels') channels;

  // Array of LogItems to parse
  @Input() data: Array<any> = [];

  // Array of selected hostname entries
  @Input() selected: Array<any> = [];
  @Output() selectedChange = new EventEmitter<Array<any>>()

  // The actual unique hostnames list
  differ: any;
  hostnames: Array<any> = [];

  constructor(private iterableDiffers: IterableDiffers) {
    this.differ = this.iterableDiffers.find([]).create(null);
  }

  // On entries change update unique hostnames
  ngDoCheck() {
    let changes = this.differ.diff(this.data);
    if (changes) {
      this.hostnames = Array.from(
        new Set(this.data.map(item => item.hostname)).values()
      )
    }
  }

  // Filter entries using given hostname selection
  onSelectionChange() {
    this.selected = this.channels.selectedOptions.selected.map(item => item.value)
    this.selectedChange.emit(this.selected)
  }

}
