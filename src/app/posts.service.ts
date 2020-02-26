import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpEventType
} from '@angular/common/http';
import { Post } from './post.model';
import { map, catchError, tap } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  error = new Subject<string>();
  firebaseUrl = 'https://ng-complete-guide-f08c4.firebaseio.com/posts.json';
  constructor(private http: HttpClient) {}

  createAndStorePost(title: string, content: string) {
    const postData: Post = { title, content };
    this.http
      .post<{ name: string }>(this.firebaseUrl, postData, {
        observe: 'response'
      })
      .subscribe(
        responseData => {
          console.log(responseData);
        },
        error => {
          this.error.next(error.message);
        }
      );
  }

  fetchPosts() {
    return this.http
      .get<{ [key: string]: Post }>(this.firebaseUrl, {
        headers: new HttpHeaders({
          'Custom-Header': 'Hello'
        }),
        params: new HttpParams().set('print', 'pretty')
      })
      .pipe(
        map(responseData => {
          const postsArray: Post[] = [];
          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              postsArray.push({ ...responseData[key], id: key });
            }
          }
          return postsArray;
        }),
        catchError(errorRes => {
          return throwError(errorRes);
        })
      );
  }

  deletePosts() {
    return this.http.delete(this.firebaseUrl, { observe: 'events' }).pipe(
      tap(event => {
        console.log(event);
        if (event.type === HttpEventType.Response) {
          console.log(event.body);
        }
      })
    ); // this returns an observable
  }
}
