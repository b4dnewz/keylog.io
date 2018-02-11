import { Component, Input, OnInit } from '@angular/core';

import { SocketService } from '../socket.service'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() title;

  // Current active keylogger clients
  clients: Array<String> = [];

  // Number of useen keylog entries
  unseenLogs: number;

  constructor(private socketService: SocketService) {
    this.socketService.counting.subscribe(v => {
      this.unseenLogs = v
    })
  }

  ngOnInit() {
    this.socketService.socket.on('clients', (data) => {
      this.clients = data;
    })
  }

}
