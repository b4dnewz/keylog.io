import { Component, IterableDiffers, OnInit, ViewChild } from '@angular/core';
import { NgZone } from '@angular/core';

import * as io from 'socket.io-client';

import { environment } from '../../environments/environment';

import { SocketService } from '../socket.service'

// Import interfaces
import { LogItem } from '../log-item'

@Component({
  selector: 'app-live-feed',
  templateUrl: './live-feed.component.html',
  styleUrls: ['./live-feed.component.css']
})

export class LiveFeedComponent implements OnInit {
  @ViewChild('channels') channels;

  // Entries filter
  textFilter: string = '';
  showFilter: Boolean;

  socket: any;

  // Entries array
  differ: any;
  items: Array<LogItem> = [];

  // Unique clients hostnames
  hostnames: Array<String> = [];
  selectedHostnames: Array<String> = [];

  constructor(
    private iterableDiffers: IterableDiffers,
    private socketService: SocketService
  ) {
    this.differ = this.iterableDiffers.find([]).create(null);
    this.socket = socketService.socket
  }

  // Filter entries using given hostname selection
  onSelectionChange() {
    this.selectedHostnames = this.channels.selectedOptions.selected.map(item => item.value)
  }

  // On entries change update unique hostnames
  ngDoCheck() {
    let changes = this.differ.diff(this.items);
    if (changes) {
      this.hostnames = Array.from(
        new Set(this.items.map(item => item.hostname)).values()
      )
    }
  }

  // Bind socket service data to entries
  ngOnInit() {
    this.items = this.socketService.items;
    this.socketService.stopCounting();
  }

  ngOnDestroy () {
    this.socketService.startCounting();
  }

}
