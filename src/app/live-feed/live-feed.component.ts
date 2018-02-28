import { Component, IterableDiffers, OnInit, ViewChild, ElementRef } from '@angular/core';

import { SocketService } from '../socket.service'
import { LogItem } from '../log-item'

@Component({
  selector: 'app-live-feed',
  templateUrl: './live-feed.component.html',
  styleUrls: ['./live-feed.component.css']
})

export class LiveFeedComponent implements OnInit {

  @ViewChild('content', { read: ElementRef }) private content: ElementRef;
  @ViewChild('table') table:ElementRef;

  // Entries filter
  textFilter: string = '';

  followStream: Boolean = true;

  // Entries array
  items: Array<LogItem> = [];

  // Array of selected hostnames to filter
  selectedHostnames: Array<String> = [];

  constructor(private socketService: SocketService) {}

  onScroll(event) {
    if (this.isAtBottom()) {
      this.followStream = true;
      return;
    }
    this.followStream = false;
  }

  isAtBottom(): Boolean {
    const el = this.content.nativeElement;
    if (el.scrollHeight - (el.scrollTop + el.clientHeight) <= 50) {
      return true;
    }
    return false;
  }

  scrollAndFollow(event) {
    event.preventDefault();
    this.content.nativeElement.scrollTop = this.content.nativeElement.scrollHeight;
  }

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
