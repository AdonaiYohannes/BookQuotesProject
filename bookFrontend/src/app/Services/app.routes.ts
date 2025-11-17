import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth-guard';


export const routes: Routes = [
{ path: '', loadComponent: () => import('../components/home/home').then(m => m.HomeComponent) },
{ path: 'login', loadComponent: () => import('../components/login/login').then(m => m.LoginComponent) },
{ path: 'register', loadComponent: () => import('../components/register/register').then(m => m.RegisterComponent) },


// Books
{ path: 'books', canActivate: [AuthGuard], loadComponent: () => import('../components/book-list/book-list').then(m => m.BookListComponent) },
{ path: 'book/new', canActivate: [AuthGuard], loadComponent: () => import('../components/book-form/book-form').then(m => m.BookFormComponent) },
{ path: 'book/:id', canActivate: [AuthGuard], loadComponent: () => import('../components/book-form/book-form').then(m => m.BookFormComponent) },


// Quotes
{ path: 'my-quotes', canActivate: [AuthGuard], loadComponent: () => import('../components/my-quotes/my-quotes').then(m => m.MyQuotesComponent) },


{ path: '**', redirectTo: '' }
];