import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';


@Injectable({ providedIn: 'root' })
export class JwtInterceptor implements HttpInterceptor {
constructor(private auth: AuthService) {}
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
const token = this.auth.token;
if (token) {
req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
return next.handle(req);
}
}

