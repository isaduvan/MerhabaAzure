import { Injectable, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { User } from "../_models/User";
import * as jwt_decode from "jwt-decode";
import { AlertifyService } from "./alertify.service";
import { Router } from "@angular/router";
@Injectable({
  providedIn: "root",
})
export class AuthenticationService {
  public currentUser: Observable<User>;
  private currentUserDecode: any;
  private currentUserSubject: BehaviorSubject<User>;
  private baseUrl: string = "";
  constructor(
    private http: HttpClient,
    @Inject("BASE_URL") baseUrl: string,
    private alertifyService: AlertifyService,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem("currentUser"))
    );
    this.currentUser = this.currentUserSubject.asObservable();
    this.baseUrl = baseUrl;
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }
  login(email: string, password: string) {
    return this.http
      .post<any>(this.baseUrl + "api/auth/login", {
        email,
        password,
      })
      .pipe(
        map((user) => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem("currentUser", JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.currentUserDecode = jwt_decode(user.token);
          localStorage.setItem(
            "currentUserName",
            this.currentUserDecode[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            ]
          );

          localStorage.setItem(
            "currentUserEmail",
            this.currentUserDecode["email"]
          );

          localStorage.setItem(
            "currentUserRole",
            this.currentUserDecode[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ]
          );
          return user;
        })
      );
  }
  logout() {
    localStorage.clear();
    this.currentUserSubject.next(null);
    this.alertifyService.warning("See you later, good bye!");
    this.router.navigate(["/login"]);
  }

  getCurrentUserName() {
    return localStorage.getItem("currentUserName");
  }
  getCurrentUserEmail() {
    return localStorage.getItem("currentUserEmail");
  }
  getCurrentUserRole() {
    return localStorage.getItem("currentUserRole");
  }

  signUp(email: string, password: string, firstname: string, lastname: string) {
    return this.http
      .post<any>(this.baseUrl + "api/auth/register", {
        email,
        password,
        firstname,
        lastname,
      })
      .pipe(
        map(
          (user) => {
            return user;
          },
          (error) => {
            return error;
          }
        )
      );
  }
}
