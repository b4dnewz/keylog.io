import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Vendor
import { MomentModule } from 'angular2-moment';
import { MaterialModule } from './Material/material.module';

// Router
import { AppRoutingModule } from './app.router';

// Components
import { AppComponent } from './app.component';
import { LiveFeedComponent } from './live-feed/live-feed.component';
import { ArchiveComponent } from './archive/archive.component';
import { LogsTableComponent } from './logs-table/logs-table.component';
import { HeaderComponent } from './header/header.component';

// Services
import { SocketService } from './socket.service'

// Filters and Pipes
import { HostnamePipe } from './hostname.pipe';
import { HostnamesListComponent } from './hostnames-list/hostnames-list.component';

// @NgModule decorator with its metadata
@NgModule({
  declarations: [
    AppComponent,
    LiveFeedComponent,
    ArchiveComponent,
    LogsTableComponent,
    HeaderComponent,
    HostnamePipe,
    HostnamesListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MaterialModule,
    MomentModule
  ],
  providers: [SocketService],
  bootstrap: [AppComponent]
})

export class AppModule { }
