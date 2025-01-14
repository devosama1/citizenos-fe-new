import { TopicService } from 'src/app/services/topic.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'topic-timeline',
  templateUrl: './topic-timeline.component.html',
  styleUrls: ['./topic-timeline.component.scss']
})
export class TopicTimelineComponent implements OnInit {
  @Input() status: any;
  @Input() voteEndsAt: any;

  STATUSES = this.TopicService.STATUSES;

  constructor(private TopicService: TopicService) { }

  ngOnInit(): void {
  }

  isValidStatus (index: number) {
    const statusesArray = Object.values(this.STATUSES).reverse().splice(0, index);
    return statusesArray.indexOf(this.status) > -1;
  };

}
