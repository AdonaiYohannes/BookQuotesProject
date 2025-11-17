import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuoteService, Quote } from '../../Services/quote.service';

@Component({
  standalone: true,
  selector: 'app-my-quotes',
  imports: [CommonModule, FormsModule],
  templateUrl: './my-quotes.html',
  styleUrl: './my-quotes.css'
})
export class MyQuotesComponent implements OnInit {
  quotes: Quote[] = [];
  newQuote: Partial<Quote> = { text: '', author: '' };

  editingId?: number;
  editCache: Partial<Quote> = {};

  constructor(
    private api: QuoteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('[MyQuotes] ngOnInit – fetching quotes…');
    this.api.getAll().subscribe({
      next: (res) => {
        console.log('[MyQuotes] received quotes:', res);
        this.quotes = res;
        // 👇 force Angular to update the view (SSR/zone-safe)
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[MyQuotes] error loading quotes', err);
      }
    });
  }

  add(): void {
    const text = this.newQuote.text?.trim() ?? '';
    const author = this.newQuote.author?.trim() ?? '';

    if (!text) return; // kräver citattext

    this.api.create({ text, author }).subscribe(q => {
      this.quotes.unshift(q);
      this.newQuote = { text: '', author: '' };
      this.cdr.detectChanges();
    });
  }

  startEdit(q: Quote): void {
    this.editingId = q.id;
    this.editCache = { text: q.text, author: q.author ?? '' };
  }

  save(id: number): void {
    const text = (this.editCache.text ?? '').trim();
    const author = (this.editCache.author ?? '').trim();

    const payload = { text, author };

    this.api.update(id, payload).subscribe(updated => {
      const i = this.quotes.findIndex(x => x.id === id);
      if (i > -1) this.quotes[i] = updated;
      this.cancel();
      this.cdr.detectChanges();
    });
  }

  cancel(): void {
    this.editingId = undefined;
    this.editCache = {};
  }

  remove(id: number): void {
    if (!confirm('Radera citat?')) return;
    this.api.delete(id).subscribe(() => {
      this.quotes = this.quotes.filter(x => x.id !== id);
      this.cdr.detectChanges();
    });
  }
}
