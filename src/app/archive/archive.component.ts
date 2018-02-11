import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MatTableDataSource, MatSort } from '@angular/material';

import { environment } from '../../environments/environment'
import { LogItem } from '../log-item'

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css']
})

export class ArchiveComponent implements OnInit {

  // The internal API endpoint
  apiUrl: string = `${environment.SERVER_URL}/api/archive`

  // Init filter dates
  today: Date = new Date();
  startDate = new Date();
  endDate = new Date();

  // Text filer for entries table
  textFilter: string = '';

  // The LogItem entries array
  items = [];

  // Array of selected hostnames to filter
  selectedHostnames: Array<String> = [];

  // Array of selected table rows
  selectedRows: Array<LogItem> = [];

  constructor(private http: HttpClient) { }

  // Build url params from object
  buildParams (obj) {
    return new HttpParams({
      fromObject: obj
    })
  }

  // Remove the selected entries
  removeSelected () {
    this.selectedRows.forEach(r => {
      this.http.delete(`${this.apiUrl}/${r.id}`).subscribe(
        data => {
          this.items.splice(this.items.indexOf(r), 1)
        },
        err => console.log('Error:', err)
      )
    })
    this.selectedRows = []
  }

  search (query) {
    let params = this.buildParams({
      start: this.startDate.toUTCString(),
      end: this.endDate.toUTCString(),
      search: query
    })
    this.http.get<Array<LogItem>>(this.apiUrl, {
      params: params
    }).subscribe(
      data => {
        this.items = data;
      },
      err => {
        this.items = []
      }
    )
  }

  update () {
    let params = this.buildParams({
      start: this.startDate.toUTCString(),
      end: this.endDate.toUTCString()
    })
    this.http.get<Array<LogItem>>(this.apiUrl, {
      params: params
    }).subscribe(
      data => {
        this.items = data;
      },
      err => {
        console.log(err)
        this.items = []
      }
    )
  }

  ngOnInit() {
    this.http.get<Array<LogItem>>(this.apiUrl)
      .subscribe(
        data => {
          this.items = data;
        },
        err => {
          console.log(err)
          this.items = []
        }
      )
  }

}
