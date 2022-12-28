import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, map, switchMap, of, catchError, share } from 'rxjs';
import { ApiResponse } from 'src/app/interfaces/apiResponse';
import { Group } from 'src/app/interfaces/group';
import { LocationService } from './location.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  params$ = new BehaviorSubject({
    showModerated:<boolean> false,
    offset:<number> 0,
    limit:<number> 8,
    orderBy: <string | null> 'name',
    order: <string | null> 'ASC',
    sourcePartnerId: <string | null> null,
    search: <string | null> null
  });


  constructor(private Location: LocationService,private http: HttpClient, private Notification: NotificationService) {;
  }

  get(id: string, params?: { [key:string]: string }): Observable<Group>  {
    let path = this.Location.getAbsoluteUrlApi('/api/users/self/groups/:groupId', {groupId: id});

    return this.http.get<Group>(path, {withCredentials: true, params, observe: 'body', responseType: 'json' })
        .pipe(switchMap((res: any) => {
          const topic = res.data;
          return of(topic);
        }))
  }

  save(data: any) {
    let path = this.Location.getAbsoluteUrlApi('/api/users/self/groups');

    return this.http.post(path, data, { withCredentials:true, responseType: 'json', observe: 'body'}).pipe(
      map((data) => {
        return data;
      }),
      catchError(res => {
        console.log('ERR', res)
        if (res.error) {
          console.log(res.error.status)
          if (res.error.status !== 401) {
            this.Notification.addError(res.error.status.message);
            console.log('MESSAGES', this.Notification.messages)
          }
        }
        return res;
      }),
      share()
    );
  }

  update(data: any) {
      const allowedFields = ['name', 'description', 'imageUrl'];
      const sendData:any = {};
      allowedFields.forEach((key)=> {
          sendData[key] = data[key] || null;
      });
      const path = this.Location.getAbsoluteUrlApi('/api/users/self/groups/:groupId', {groupId: data.id || data.groupId});
      return this.http.put(path, sendData, { withCredentials:true, responseType: 'json', observe: 'body'}).pipe(
          map((data) => {
            return data;
          }),
          catchError(res => {
            console.log('ERR', res)
            if (res.error) {
              console.log(res.error.status)
              if (res.error.status !== 401) {
                this.Notification.addError(res.error.status.message);
                console.log('MESSAGES', this.Notification.messages)
              }
            }
            return res;
          }),
          share()
        );
  }

  delete(data: any) {
      const path = this.Location.getAbsoluteUrlApi('/api/users/self/groups/:groupId', {groupId: data.id || data.groupId});

      return this.http.delete(path).pipe(
        map((data) => {
          return data;
        }),
        catchError(res => {
          console.log('ERR', res)
          if (res.error) {
            console.log(res.error.status)
            if (res.error.status !== 401) {
              this.Notification.addError(res.error.status.message);
              console.log('MESSAGES', this.Notification.messages)
            }
          }
          return res;
        }),
        share()
      );
  }

  join (token: string) {
      const path = this.Location.getAbsoluteUrlApi('/api/groups/join/:token', {token});

      return this.http.post<ApiResponse>(path, {}).pipe(
        map((res) => {
          return res.data;
        }),
        catchError(res => {
          console.log('ERR', res)
          if (res.error) {
            console.log(res.error.status)
            if (res.error.status !== 401) {
              this.Notification.addError(res.error.status.message);
              console.log('MESSAGES', this.Notification.messages)
            }
          }
          return res;
        }),
        share()
      );
  }
}