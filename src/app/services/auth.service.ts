import { ConfigService } from 'src/app/services/config.service';
import { ApiResponse } from 'src/app/interfaces/apiResponse';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { switchMap, catchError, tap, take, map } from 'rxjs/operators';
import { LocationService } from './location.service';
import { NotificationService } from './notification.service';
import { User } from '../interfaces/user';
import { MatDialog } from '@angular/material/dialog';
import { PrivacyPolicyComponent } from '../account/components/privacy-policy/privacy-policy.component';
import { AddEmailComponent } from '../account/components/add-email/add-email.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user$: Observable<User> | null;
  public loggedIn$ = new BehaviorSubject(false);
  public user = new BehaviorSubject({ id: null });

  constructor(private dialog: MatDialog, private Location: LocationService, private http: HttpClient, private Notification: NotificationService, private config: ConfigService) {
    this.user$ = this.status();

    this.loggedIn$.pipe(tap((status) => {
      if (status === false) {
        this.logout().pipe(take(1)).subscribe((res) => console.log('logged out'));
      }
    }))
  }

  resolveAuthorizedPath(path: string) {
    let authorized = '';
    const pathName = this.loggedIn$.subscribe((res) => {
      if (res === true) {
        authorized = '/users/self';
      }

      return `/api${authorized}${path}`
    });
    return `/api${authorized}${path}`
  }

  signUp(data: any) {

    const path = this.Location.getAbsoluteUrlApi('/api/auth/signup');

    return this.http.post(path, data);
  };

  login(email: string, password: string) {
    const data = {
      email: email,
      password: password
    };

    const path = this.Location.getAbsoluteUrlApi('/api/auth/login');

    return this.http.post<any>(path, data, { withCredentials: true, responseType: 'json', observe: 'body' }).pipe(
      map((data) => {
        return data;
      })
    );
  };

  logout() {
    const pathLogoutEtherpad = this.Location.getAbsoluteUrlEtherpad('/ep_auth_citizenos/logout');
    const pathLogoutAPI = this.Location.getAbsoluteUrlApi('/api/auth/logout');
    return forkJoin([
      this.http.get(pathLogoutEtherpad, { withCredentials: true, responseType: 'text' }),
      this.http.post(pathLogoutAPI, {}, { withCredentials: true })]).pipe(
        switchMap(([res]) => {
          this.user$ = null;
          this.loggedIn$.next(false);
          return res;
        }),
        catchError((err) => {
          console.log(err); return err;
        })
      );
  }

  status() {
    const path = this.Location.getAbsoluteUrlApi('/api/auth/status');
    return this.user$ = this.http.get<User>(path, { withCredentials: true, responseType: 'json', observe: 'body' }).pipe(
      switchMap((res: any) => {
        const user = res.data;
        if (!user.termsVersion || user.termsVersion !== this.config.get('legal').version) {
          const tosDialog = this.dialog.open(PrivacyPolicyComponent, {
            data: { user }
          });
        } else if (!user.email) {
          const emailDialog = this.dialog.open(AddEmailComponent, {
            data: { user }
          });
        } else {
          user.loggedIn = true;
          this.user.next({ id: user.id });
          this.loggedIn$.next(true);
          return of(user);
        }
        return of();
      }),
      catchError(res => {
        if (res.error) {
          if (res.status !== 401) {
            this.Notification.addError(res.error.status.message);
          }
        }
        return of(null);
      }),
      map(res => res)
    );
  };

  loginMobiilIdInit(data: any) {
    const path = this.Location.getAbsoluteUrlApi('/api/auth/mobile/init');

    return this.http.post<ApiResponse>(path, data, { withCredentials: true, responseType: 'json', observe: 'body' }).pipe(
      map(res => res.data)
    );
  };

  loginMobiilIdStatus(token: string) {
    const path = this.Location.getAbsoluteUrlApi('/api/auth/mobile/status');

    return this.http.get<ApiResponse>(path, { params: { token: token }, withCredentials: true, responseType: 'json', observe: 'body' }).pipe(
      map(res => res.data)
    );
  };

  loginSmartIdInit(data: any) {
    const path = this.Location.getAbsoluteUrlApi('/api/auth/smartid/init');

    return this.http.post<ApiResponse>(path, data, { withCredentials: true, responseType: 'json', observe: 'body' }).pipe(
      map(res => res.data)
    );
  };

  loginSmartIdStatus(token: string) {
    const path = this.Location.getAbsoluteUrlApi('/api/auth/smartid/status');

    return this.http.get<ApiResponse>(path, { params: { token: token }, withCredentials: true, responseType: 'json', observe: 'body' }).pipe(
      map(res => res.data)
    );
  };

  idCardInit() {
    return this.http.get<ApiResponse>(this.config.get('features').authentication.idCard.url, { withCredentials: true, responseType: 'json', observe: 'body' })
      .pipe(
        map(res => res.data)
      );
  };
  loginIdCard(userId?: string) {
    return this.idCardInit()
      .pipe(
        switchMap((response) => {
          console.log('response', response)
          if (response.token) {
            const path = this.Location.getAbsoluteUrlApi('/api/auth/id');
            if (userId) {
              response.userId = userId;
            }
            return this.http.get(path, { params: response, withCredentials: true, responseType: 'json', observe: 'body' });
          } else {
            return response;
          }
        })
      );
  };

  passwordReset(data: any) {
    const path = this.Location.getAbsoluteUrlApi('/api/auth/password/reset');
    return this.http.post<ApiResponse>(path, data, { withCredentials: true, responseType: 'json', observe: 'body' }).pipe(
      map(res => res.data)
    );
  };

  passwordResetSend(data: any) {
    const path = this.Location.getAbsoluteUrlApi('/api/auth/password/reset/send');
    return this.http.post<ApiResponse>(path, data, { withCredentials: true, responseType: 'json', observe: 'body' }).pipe(
      map(res => res.data)
    );
  };
}
