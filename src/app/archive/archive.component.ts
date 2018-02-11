import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MatTableDataSource, MatSort } from '@angular/material';

import { environment } from '../../environments/environment'

// Import interfaces
import { LogItem } from '../log-item'

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css']
})
export class ArchiveComponent implements OnInit {

  apiUrl: string = `${environment.SERVER_URL}/api/archive`

  today: Date = new Date();
  startDate = new Date();
  endDate = new Date();

  textFilter: string = '';

  items = [];

  constructor(
    private http: HttpClient
  ) { }

  buildParams (obj) {
    return new HttpParams({
      fromObject: obj
    })
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
        console.log(err)
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
