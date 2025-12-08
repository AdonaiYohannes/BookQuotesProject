import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Quote {
  id: number;
  text: string;
  author: string | null;        
  source?: string | null;
  addedBy: string;
  userId: number;
}

export interface CreateQuote {
  text: string;
  author: string;
  source?: string | null;
}

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly base = environment.apiBaseUrl + '/quotes';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Quote[]>(this.base);
  }

  getMyQuotes() {
    return this.http.get<Quote[]>(`${this.base}/my-quotes`);
  }

  create(payload: CreateQuote) {
    return this.http.post<Quote>(this.base, payload);
  }

  update(id: number, payload: CreateQuote) {
    return this.http.put<Quote>(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
