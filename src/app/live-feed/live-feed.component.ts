import { Component, IterableDiffers, OnInit } from '@angular/core';

import { SocketService } from '../socket.service'
import { LogItem } from '../log-item'

@Component({
  selector: 'app-live-feed',
  templateUrl: './live-feed.component.html',
  styleUrls: ['./live-feed.component.css']
})

export class LiveFeedComponent implements OnInit {

  // Entries filter
  textFilter: string = '';

  // Entries array
  items: Array<LogItem> = [];

  // Array of selected hostnames to filter
  selectedHostnames: Array<String> = [];

  constructor(private socketService: SocketService) {}

  // Bind socket service data to entries
  ngOnInit() {
    this.items = this.socketService.items;
    this.socketService.stopCounting();
  }

  // When route is left restart counting for new entries (unread)
  ngOnDestroy () {
    this.socketService.startCounting();
  }

}
