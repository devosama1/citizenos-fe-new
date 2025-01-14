import { MyTopicComponent } from './components/my-topic/my-topic.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyTopicsComponent } from './my-topics.component';
import { TopicInviteDialogComponent } from '../topic/components/topic-invite/topic-invite.component';
import { TopicSettingsDialogComponent } from '../topic/components/topic-settings/topic-settings.component';

const routes: Routes = [
  {
    path: '', data: {name: 'myTopicsView'}, component: MyTopicsComponent, children: [
      {
        path: ':topicId', data: {name: 'myTopicView'}, children: [
          { path: '', component: MyTopicComponent, outlet: 'mytopicsright', data: {name: 'myTopicView'}},
          {
            path: 'invite', children: [
              { path: '', component: TopicInviteDialogComponent }
            ]
          },
          {
            path: 'settings', children: [
              { path: '', component: TopicSettingsDialogComponent }
            ]
          },
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyTopicsRoutingModule {
  constructor() {
  }
}
