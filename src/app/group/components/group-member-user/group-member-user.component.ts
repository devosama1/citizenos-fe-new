import { AuthService } from 'src/app/services/auth.service';
import { GroupService } from 'src/app/services/group.service';
import { GroupMemberUserService } from 'src/app/services/group-member-user.service';
import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { take, catchError } from 'rxjs/operators';
import { Group } from 'src/app/interfaces/group';
import { GroupMemberUser } from 'src/app/interfaces/user';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'group-member-user',
  templateUrl: './group-member-user.component.html',
  styleUrls: ['./group-member-user.component.scss']
})
export class GroupMemberUserComponent implements OnInit {
  @Input() member: GroupMemberUser | any;
  @Input() group: Group | any;
  @Input() fields?: any;
  memberLevels = this.GroupMemberUser.LEVELS;
  constructor(private dialog: MatDialog, private AuthService: AuthService, private GroupMemberUser: GroupMemberUserService, private GroupService: GroupService) { }

  ngOnInit(): void {
  }

  isVisibleField(field: string) {
    return this.fields?.indexOf(field) > -1
  }

  canUpdate () {
    return this.GroupService.canUpdate(this.group);
  }
  doUpdateMemberUser(level: string) {
    if (this.member && this.member?.level !== level) {
      const oldLevel = this.member.level;
      this.member.level = level;
      if (this.group) {
        this.GroupMemberUser
          .update({ groupId: this.group.id, userId: this.member.userId || this.member.id }, this.member)
          .pipe(take(1),
          catchError((error) => {
            this.member.level = oldLevel
            return error;
          }))
          .subscribe((res) => {
            console.log('RES', res)
          })
      }
    }
  };

  doDeleteMemberUser() {
      if (this.member.id === this.AuthService.user.value.id) {
  //      return this.doLeaveGroup();
      }
      const deleteUserDialog = this.dialog.open(ConfirmDialogComponent, {
        data: {
          level: 'delete',
          heading: 'MODALS.TOPIC_MEMBER_USER_DELETE_CONFIRM_HEADING',
          title: 'MODALS.TOPIC_MEMBER_USER_DELETE_CONFIRM_TXT_ARE_YOU_SURE',
          confirmBtn: 'MODALS.TOPIC_MEMBER_USER_DELETE_CONFIRM_YES',
          closeBtn: 'MODALS.TOPIC_MEMBER_USER_DELETE_CONFIRM_NO'
        }
      });
      deleteUserDialog.afterClosed().subscribe(result => {
        if (result === true) {
          this.member.groupId = this.group.id;
          this.GroupMemberUser.delete({ groupId: this.group.id, userId: this.member.userId || this.member.id })
            .pipe(take(1))
            .subscribe(() => {
              //return this.GroupMemberUserService.reset(); // Good old topic.members.users.splice wont work due to group permission inheritance
            });
        }
      });/*
        this.ngDialog
          .openConfirm({
            template: '/views/modals/topic_member_user_delete_confirm.html',
            data: {
              user: member
            }
          })
          .then(() => {
            member.topicId = topic.id;
            this.TopicMemberUserService.delete({ topicId: topic.id, userId: member.userId || member.id })
              .then(() => {
                return this.TopicMemberUserService.reload(); // Good old topic.members.users.splice wont work due to group permission inheritance
              });
          }, angular.noop);*/
    };
   /* const member = this.member
    if (this.group) {
      const group = this.group
      if (member.id === this.sAuth.user.id) { // IF User tries to delete himself, show "Leave" dialog instead
        return this.doLeaveGroup();
      }
      this.ngDialog
        .openConfirm({
          template: '/views/modals/group_member_user_delete_confirm.html',
          data: {
            user: member
          }
        })
        .then(() => {
          this.GroupMemberUser
            .delete({ groupId: group.id, userId: member.userId })
            .then(() => {
              group.getMemberUsers();
            });
        }, angular.noop);

    }*/

}
