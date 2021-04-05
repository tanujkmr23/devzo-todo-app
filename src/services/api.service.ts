import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const API_BASE_URL = environment.apiRoot;
const httpOptions = {
  headers: new HttpHeaders({
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*',
    'AuthToken': environment.authToken
  })
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor( public http: HttpClient ) { }

  /**
   * Api to get list of users
   */
  public listUsers() {
    return this.http.get(API_BASE_URL + '/listusers', httpOptions)
  }

  /**
   * Api to get list of tasks
   */
  public listTasks() {
    return this.http.get(API_BASE_URL + '/list', httpOptions)
  }

  /**
   * 
   * @param payload 
   * Api to create task
   */
  public createTask(payload:any) {
    return this.http.post(API_BASE_URL + '/create', payload, httpOptions)
  }

  /**
   * 
   * @param payload 
   * Api to update task
   */
  public updateTask(payload:any) {
    return this.http.post(API_BASE_URL + '/update', payload, httpOptions)
  }

  /**
   * 
   * @param payload 
   * API to delete task
   */
  public deleteTask(payload:any) {
    return this.http.post(API_BASE_URL + '/delete', payload, httpOptions)
  }


}
