import { Component, OnInit, Input, Output, EventEmitter, ViewChild, IterableDiffers, ElementRef } from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

import { LogItem } from '../log-item'

@Component({
  selector: 'logs-table',
  templateUrl: './logs-table.component.html',
  styleUrls: ['./logs-table.component.css']
})

export class LogsTableComponent implements OnInit {

  @Input() autoScroll: Boolean = false;
  @Input() selectable: Boolean;
  @Input() filter: string = '';
  @Input() data: Array<LogItem> = [];

  // Selection
  @Input() selected?: Array<LogItem>;
  @Output() selectedChange = new EventEmitter<Array<LogItem>>();

  @ViewChild('table', { read: ElementRef }) private table: ElementRef;
  @ViewChild(MatSort) sort: MatSort;

  differ: any;
  selection: any;

  // Table details
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
  }

  ngOnChanges(changes) {
    this.dataSource.data = this.data
    this.dataSource.filter = this.filter.trim().toLowerCase()
  }

  ngDoCheck() {
    let changes = this.differ.diff(this.data);
    if (changes) {
      this.dataSource.data = this.data

      // Scroll to bottom
      if (this.autoScroll) {
        this.table.nativeElement.scrollIntoView({
          block: "end",
          behavior: "smooth"
        })
      }
    }
  }

  ngOnInit() {
    this.dataSource.data = this.data

    if (this.selectable) {
      this.displayedColumns.unshift('select')
      this.selection = new SelectionModel<LogItem>(true, []);
      this.selection.onChange.subscribe(v => {
        this.selectedChange.emit(this.selection.selected)
      })
    }

    // Scroll to bottom
    if (this.autoScroll) {
      this.table.nativeElement.scrollIntoView({
        block: "end",
        behavior: "smooth"
      })
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  // Check if all rows are selected
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected == numRows;
  }

  // Toggle all rows
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));

    this.selectedChange.emit(this.selection.selected)
  }

}
