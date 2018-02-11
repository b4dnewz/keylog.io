import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LiveFeedComponent } from './live-feed/live-feed.component'
import { ArchiveComponent } from './archive/archive.component'

const routes: Routes = [
  {
    path: '',
    component: LiveFeedComponent,
  },
  {
    path: 'archive',
    component: ArchiveComponent,
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class AppRoutingModule { }
