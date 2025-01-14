import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Topic } from 'src/app/interfaces/topic';
import { TopicVoteSignEsteidComponent } from '../topic-vote-sign-esteid/topic-vote-sign-esteid.component';
import { TopicVoteSignSmartidComponent } from '../topic-vote-sign-smartid/topic-vote-sign-smartid.component';

export interface TopicVoteSignData {
  topic: Topic,
  options: any
};

@Component({
  selector: 'app-topic-vote-sign',
  templateUrl: './topic-vote-sign.component.html',
  styleUrls: ['./topic-vote-sign.component.scss']
})
export class TopicVoteSignComponent implements OnInit {
  topic!:Topic;
  options!: any;
  constructor(private dialog:MatDialog, @Inject(MAT_DIALOG_DATA) public data: TopicVoteSignData,) {
    this.topic = data.topic;
    this.options = data.options;
  }

  ngOnInit(): void {
  }

  doSignEsteId() {
    this.dialog
      .open(TopicVoteSignEsteidComponent,{
        data: {
          topic: this.topic,
          options: this.options
        }
      });
  };

  doSignSmartId() {
    this.dialog
      .open(TopicVoteSignSmartidComponent,{
        data: {
          topic: this.topic,
          options: this.options
        }
      });
  };
}
