import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MatTableDataSource, MatSnackBar, MatSort } from '@angular/material';

import { environment } from '../../environments/environment';
import { LogItem } from '../log-item';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css']
})

export class ArchiveComponent implements OnInit {

  // The internal API endpoint
  apiUrl = `${environment.SERVER_URL}/api/archive`;

  // Init filter dates
  today: Date = new Date();
  startDate = new Date();
  endDate = new Date();

  // Text filer for entries table
  textFilter = '';

  // The LogItem entries array
  items = [];

  // Array of selected hostnames to filter
  selectedHostnames: Array<String> = [];

  // Array of selected table rows
  selectedRows: Array<LogItem> = [];

  // Pagination component options
  total: number;
  currentPage = 0;
  pageSize = 50;
  pageSizeOptions: Array<number> = [50, 100, 250, 500];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) { }

  // Build url params from object
  buildParams (obj) {
    return new HttpParams({
      fromObject: obj
    });
  }

  getItems(options: Object = {}) {
    const opts = Object.assign({}, {
      start: this.startDate.toUTCString(),
      end: this.endDate.toUTCString(),
      page: this.currentPage,
      limit: this.pageSize
    }, options);

    const params = this.buildParams(opts);

    return this.http.get<any>(this.apiUrl, {
      params: params
    }).subscribe(
      data => {
        // Show a snackbar to the user
        if (data.data.length === 0) {
          this.snackBar.open('There are not results.', 'DISMISS', {
            duration: 2000,
          });
        }

        this.items = data.data;
        this.total = data.total;
        this.currentPage = data.page;
        this.pageSize = data.limit;
      },
      err => {
        this.snackBar.open('There was an error with the request.', 'DISMISS', {
          duration: 3500
        });
        this.items = [];
        this.total = 0;
      }
    );
  }

  // When the page or page limit is changed
  changePage(event) {
    return this.getItems({
      page: event.pageIndex,
      limit: event.pageSize
    });
  }

  // Remove the selected entries
  removeSelected () {
    this.selectedRows.forEach(r => {
      this.http.delete(`${this.apiUrl}/${r.id}`).subscribe(
        data => {
          this.items.splice(this.items.indexOf(r), 1);
        },
        err => console.log('Error:', err)
      );
    });
    this.selectedRows = [];

    // Update the current displayed items
    return this.getItems();
  }

  // When enter is pressed on the search/filter bar
  search (query) {
    return this.getItems({
      search: query,
      page: 0
    });
  }

  update () {
    this.getItems();
  }

  ngOnInit() {
    this.getItems();
  }

}
