import { Component, OnInit, Input } from '@angular/core';
import { Topic } from 'src/app/interfaces/topic';
import { TopicVoteService } from 'src/app/services/topic-vote.service';
import { NotificationService } from 'src/app/services/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'topic-vote-create',
  templateUrl: './topic-vote-create.component.html',
  styleUrls: ['./topic-vote-create.component.scss']
})
export class TopicVoteCreateComponent implements OnInit {
  @Input() topic!: Topic;
  VOTE_TYPES = this.TopicVoteService.VOTE_TYPES;
  voteTypes = Object.keys(this.VOTE_TYPES);
  VOTE_AUTH_TYPES = this.TopicVoteService.VOTE_AUTH_TYPES;
  HCount = 24;
  timeFormat: any;
  timezones = <any[]>[];
  datePickerMin = new Date();
  private CONF = {
    defaultOptions: {
      regular: [
        {
          value: 'Yes',
          enabled: true
        },
        {
          value: 'No',
          enabled: true
        }
      ],
      multiple: [
        { value: null },
        { value: null },
        { value: null }
      ]
    },
    extraOptions: {
      neutral: {
        value: 'Neutral',
        enabled: false
      }, // enabled - is the option enabled by default
      veto: {
        value: 'Veto',
        enabled: false
      }
    },
    autoClose: {
      allMembersVoted: {
        value: 'allMembersVoted',
        enabled: false
      }
    },
    optionsMax: 10,
    optionsMin: 2
  };
  public vote = {
    topicId: <string>'',
    options: <any>[],
    delegationIsAllowed: false,
    type: '',
    authType: '',
    maxChoices: <number>1,
    minChoices: <number>1,
    reminderTime: <Date | null>null,
    autoClose: <any>this.CONF.autoClose,
    endsAt: <Date | null>null
  };
  deadline = <any>null;
  numberOfDaysLeft = 0;
  endsAt = <any>{
    date: null,
    min: 0,
    h: 0,
    timezone: (new Date().getTimezoneOffset() / -60),
    timeFormat: '24'
  };

  errors = <any>null;
  extraOptions = <any>{
    neutral: {
      value: 'Neutral',
      enabled: false
    }, // enabled - is the option enabled by default
    veto: {
      value: 'Veto',
      enabled: false
    }
  };
  reminder = false;
  reminderOptions = [{ value: 1, unit: 'days' }, { value: 2, unit: 'days' }, { value: 3, unit: 'days' }, { value: 1, unit: 'weeks' }, { value: 2, unit: 'weeks' }, { value: 1, unit: 'month' }];

  constructor(
    private TopicVoteService: TopicVoteService,
    private Translate: TranslateService,
    private Notification: NotificationService,
    private router: Router
  ) {
    this.setTimeZones();
  }

  ngOnInit(): void {
    this.vote.topicId = this.topic.id;
  }

  private setTimeZones() {
    let x = -14;
    while (x <= 12) {
      let separator = '+';
      if (x < 0) separator = '';
      this.timezones.push({
        name: `Etc/GMT${separator}${x}`,
        value: x
      });
      x++;
    }
  };

  setVoteType(voteType: string) {
    if (voteType == this.VOTE_TYPES.multiple) {
      this.vote.type = voteType;
      this.vote.options = this.CONF.defaultOptions.multiple;
      this.vote.maxChoices = 1;
    } else {
      this.vote.type = this.VOTE_TYPES.regular;
      this.vote.options = this.CONF.defaultOptions.regular;
    }
  };

  addOption() {
    this.vote.options.push({ value: null });
  };

  removeOption(key: number) {
    this.vote.options.splice(key, 1);
  };

  optionsCountUp(type?: string) {
    const options = this.vote.options.filter((option: any) => {
      return !!option.value;
    });
    if (type === 'min' && this.vote.minChoices < options.length) {
      this.vote.minChoices++;
      if (this.vote.minChoices > this.vote.maxChoices) {
        this.vote.maxChoices = this.vote.minChoices;
      }
    } else if (this.vote.maxChoices < options.length) {
      this.vote.maxChoices++;
    }
  };

  optionsCountDown(type?: string) {
    if (type === 'min' && this.vote.minChoices > 1) {
      this.vote.minChoices--;
    }
    else if (this.vote.maxChoices > 1) {
      this.vote.maxChoices--;
      if (this.vote.minChoices > this.vote.maxChoices) {
        this.vote.minChoices = this.vote.maxChoices;
      }
    }
  };

  getStepNum(num: number) {
    if (this.vote.type === this.VOTE_TYPES.multiple) num++;
    return num;
  };

  getDeadline() {
    if (this.deadline === true) {
      this.setEndsAtTime();
    }
    return this.deadline;
  }

  setEndsAtTime() {
    console.log(this.endsAt.date)
    this.endsAt.date = this.endsAt.date || new Date();
    this.deadline = new Date(this.endsAt.date);
    console.log(this.deadline)
    let hour = this.endsAt.h;
    console.log(this.endsAt.h, this.endsAt.timeFormat, hour)
    if (this.endsAt.timeFormat === 'PM') { hour += 12; }
    this.deadline.setUTCHours(hour - this.endsAt.timezone);
    this.deadline.setMinutes(this.endsAt.min);
    console.log(this.deadline)
    this.daysToVoteEnd();
  };

  daysToVoteEnd() {
    if (this.deadline) {

      if (this.deadline.toDateString() === new Date().toDateString()) {
        this.deadline = new Date()//moment(new Date()).startOf('day').add(1, 'day');
        this.deadline = this.deadline.setDate(this.deadline.getDate() + 1);
        this.endsAt.date = this.deadline;
      }
      this.numberOfDaysLeft = Math.ceil((new Date(this.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    }
    return this.numberOfDaysLeft;
  };

  formatTime(val: number | string) {
    if (val < 10) {
      val = '0' + val;
    }

    return val;
  };

  setTimeFormat() {
    this.HCount = 24;
    if (this.timeFormat !== 24) {
      this.HCount = 12;
      if (this.endsAt.h > 12) {
        this.endsAt.h -= 12;
      }
    }
    this.setEndsAtTime();
  };

  getTimeZoneName(value: number) {
    return (this.timezones.find((item) => { return item.value === value })).name;
  };

  isVisibleReminderOption(time: any) {
    let timeItem = new Date(this.deadline);
    switch (time.unit) {
      case 'weeks':
        timeItem.setDate(timeItem.getDate() + 1 - (time.value * 7));
        break;
      case 'month':
        timeItem.setMonth(timeItem.getMonth() - time.value);
        break
      default:
        timeItem.setDate(timeItem.getDate() + 1 - time.value);
    }
    if (timeItem > new Date()) return true;

    return false;
  };

  selectedReminderOption() {
    let voteDeadline = new Date(this.deadline);
    let reminder = new Date(this.vote.reminderTime || '');
    let diffTime = voteDeadline.getTime() - reminder.getTime();
    const days = Math.ceil(diffTime / (1000 * 3600 * 24));
    const weeks = Math.ceil(diffTime / (1000 * 3600 * 24 * 7));
    const months = (voteDeadline.getMonth() - reminder.getMonth() +
      12 * (voteDeadline.getFullYear() - reminder.getFullYear()));

    let item = this.reminderOptions.find((item: any) => {
      if (item.value === days && item.unit === 'days') return item;
      else if (item.value === weeks && item.unit === 'weeks') return item;
      else if (item.value === months && item.unit === 'month') return item;
    });

    if (!item) {
      item = this.reminderOptions[0];
      this.setVoteReminder(item);
    }

    return this.Translate.instant('OPTION_' + item.value + '_' + item.unit.toUpperCase());
  };

  setVoteReminder(time: any) {
    let reminderTime = new Date(this.deadline);
    switch (time.unit) {
      case 'weeks':
        reminderTime.setDate(reminderTime.getDate() - (time.value * 7));
        break;
      case 'month':
        reminderTime.setMonth(reminderTime.getMonth() - time.value);
        break
      default:
        reminderTime.setDate(reminderTime.getDate() - time.value);
    }
    this.vote.reminderTime = reminderTime;
  };

  createVote() {
    this.Notification.removeAll();


    for (let o in this.extraOptions) {
      const option = this.extraOptions[o];
      if (option.enabled) {
        this.vote.options.push({ value: option.value });
      }
    }

    if (!this.reminder) {
      this.vote.reminderTime = this.vote.reminderTime = null;
    }

    this.vote.options = this.vote.options.filter((option: any) => {
      return !!option.value
    });
    if (this.deadline) {
      this.vote.endsAt = this.deadline
    }
    this.TopicVoteService.save(this.vote)
      .pipe(take(1))
      .subscribe({
        next: (vote) => {
          console.log(vote)
          this.router.navigate([vote.id]);
        },
        error: (res) => {
          console.debug('createVote() ERR', res, res.errors, this.vote.options);
          this.errors = res.errors;
        }
      });
  };
}
