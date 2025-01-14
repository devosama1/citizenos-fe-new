import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
@Component({
  selector: 'app-password-forgot',
  templateUrl: './password-forgot.component.html',
  styleUrls: ['./password-forgot.component.scss']
})
export class PasswordForgotComponent implements OnInit {
  passwordForgotForm = new FormGroup({
    email: new FormControl()
  });
  errors: any;
  constructor(private dialog: MatDialog, private AuthService: AuthService, private Notification: NotificationService) { }

  ngOnInit(): void {
  }

  doPasswordReset() {
    this.errors = null;

    const success = () => {
      this.dialog.closeAll(); // Close all dialogs, including this one..
      this.Notification.addInfo('MSG_INFO_PASSWORD_RECOVERY_EMAIL_SENT');
    };

    const error = (res: any) => {
      this.errors = res.errors;
    };

    this.AuthService
      .passwordResetSend(this.passwordForgotForm.value)
      .pipe(take(1))
      .subscribe({ next: success, error: error });
  };
}
