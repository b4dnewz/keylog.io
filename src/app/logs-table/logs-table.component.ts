import { Component, OnInit, Input, ViewChild, IterableDiffers } from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';

import { LogItem } from '../log-item'

@Component({
  selector: 'logs-table',
  templateUrl: './logs-table.component.html',
  styleUrls: ['./logs-table.component.css']
})

export class LogsTableComponent implements OnInit {

  @Input() data: Array<LogItem> = [];
  @Input() filter: string = '';

  @ViewChild(MatSort) sort: MatSort;

  differ: any;

  dataSource = new MatTableDataSource<LogItem>();
  displayedColumns: Array<String> = [
    'element',
    'key',
    'hostname',
    'path',
    'timestamp'
  ]

  constructor(
    private iterableDiffers: IterableDiffers
  ) {
    this.differ = this.iterableDiffers.find([]).create(null);
  }

  ngOnChanges (changes) {
    this.dataSource.data = this.data
    this.dataSource.filter = this.filter.trim().toLowerCase()
  }

  ngDoCheck() {
    let changes = this.differ.diff(this.data);
    if (changes) {
      this.dataSource.data = this.data
    }
  }

  ngOnInit() {
    this.dataSource.data = this.data
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

}
