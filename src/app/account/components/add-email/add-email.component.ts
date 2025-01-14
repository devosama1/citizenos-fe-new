import { AuthService } from 'src/app/services/auth.service';
import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { NotificationService } from 'src/app/services/notification.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs';
import { User } from 'src/app/interfaces/user';
export interface AddEmailData {
  user: User
}
@Component({
  selector: 'app-add-email',
  templateUrl: './add-email.component.html',
  styleUrls: ['./add-email.component.scss']
})
export class AddEmailComponent implements OnInit {
  user!: User;
  email?: string;
  errors?: any;
  wWidth = window.innerWidth;
  constructor(@Inject(MAT_DIALOG_DATA) private data: AddEmailData,
    private dialog: MatDialog,
    private AuthService: AuthService,
    private Notification: NotificationService,
    private router: Router,
    private UserService: UserService) {
    this.user = data.user;
  }

  ngOnInit(): void {
  }

  doUpdateProfile() {
    this.errors = null;

    if (this.email) {
      this.UserService
        .update(this.user.name, this.email)
        .pipe(take(1))
        .subscribe((userData) => {
          this.Notification.addInfo('MSG_INFO_CHECK_EMAIL_TO_VERIFY_YOUR_NEW_EMAIL_ADDRESS');
          this.dialog.closeAll();
        });
    } else {
      this.errors = { email: 'MODALS.ADD_EMAIL_ERROR_MSG_INVALID' }
    }

  }

  logout() {
    this.AuthService
      .logout()
      .pipe(
        take(1)
      )
      .subscribe(() => {
        this.router.navigate(['/account/login']);
      });
  }
}
