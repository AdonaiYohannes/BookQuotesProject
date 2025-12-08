import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


export interface Book { id: number; title: string; author: string; published: string | null; addedBy: string; userId: number; }
export interface CreateBook { title: string; author: string; published: string | null; }


@Injectable({ providedIn: 'root' })
export class BookService {
    private base = environment.apiBaseUrl + '/books';
    constructor(private http: HttpClient) {}


getAll() { return this.http.get<Book[]>(this.base); }
getMyBooks() { return this.http.get<Book[]>(`${this.base}/my-books`);}
get(id: number) { return this.http.get<Book>(`${this.base}/${id}`); }
create(payload: CreateBook) { return this.http.post<Book>(this.base, payload); }
update(id: number, payload: CreateBook) { return this.http.put<Book>(`${this.base}/${id}`, payload); }
delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}