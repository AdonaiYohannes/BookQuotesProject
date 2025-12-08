import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuoteService, Quote, CreateQuote } from '../../Services/quote.service';
import { AuthService } from '../../Services/auth.service';

@Component({
  standalone: true,
  selector: 'app-my-quotes',
  imports: [CommonModule, FormsModule],
  templateUrl: './my-quotes.html',
  styleUrl: './my-quotes.css'
})
export class MyQuotesComponent implements OnInit {
  quotes: Quote[] = [];
  showAllQuotes = false; // Toggles between my quotes and all quotes
  currentUserId: number | null = null;

  newQuote: { text: string; author: string; source?: string } = { 
    text: '', 
    author: '',
    source: '' 
  };

  editingId?: number;
  editCache: { text: string; author: string; source?: string } = { 
    text: '', 
    author: '',
    source: '' 
  };

  constructor(
    private api: QuoteService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('[MyQuotes] ngOnInit – fetching quotes…');
    this.currentUserId = this.authService.getCurrentUserId();
    this.fetch();
  }

  fetch(): void {
    const obs = this.showAllQuotes 
      ? this.api.getAll()       // Show all quotes
      : this.api.getMyQuotes(); // Show only my quotes

      obs.subscribe({
      next: (res) => {
        console.log('[MyQuotes] received quotes:', res);
        this.quotes = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[MyQuotes] error loading quotes', err);
      }
    });
  }

   toggleView(): void {
    this.showAllQuotes = !this.showAllQuotes;
    this.fetch();
  }

  // Checks if the quote belongs to the current user
  isMyQuote(quote: Quote): boolean {
    return this.currentUserId === quote.userId;
  }

  add(): void {
    const text = this.newQuote.text?.trim() ?? '';
    const author = this.newQuote.author?.trim() ?? '';
    const source = this.newQuote.source?.trim() ?? '';

    if (!text) return; // kräver citattext

    const payload: CreateQuote = { text, author, source: source || null };

    this.api.create(payload).subscribe({
      next: (q) => {
        console.log('[MyQuotes] created quote:', q);
        this.newQuote = { text: '', author: '', source: '' };
        this.fetch(); // Refresh list
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[MyQuotes] error creating quote', err);
      }
    });
  }

  startEdit(q: Quote): void {
    // Only allow editing own quotes
    if (!this.isMyQuote(q)) {
      alert('Du kan endast redigera dina egna citat.');
      return;
    }
    
    this.editingId = q.id;
    this.editCache = { 
      text: q.text, 
      author: q.author ?? '',
      source: q.source ?? '' 
    };
  }

  save(id: number): void {
    const text = (this.editCache.text ?? '').trim();
    const author = (this.editCache.author ?? '').trim();
    const source = (this.editCache.source ?? '').trim();

    const payload: CreateQuote = { text, author, source: source || null };

    this.api.update(id, payload).subscribe({
      next: (updated) => {
        console.log('[MyQuotes] updated quote:', updated);
        const i = this.quotes.findIndex(x => x.id === id);
        if (i > -1) this.quotes[i] = updated;
        this.cancel();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[MyQuotes] error updating quote', err);
        if (err.status === 403) {
          alert('Du har inte behörighet att redigera detta citat.');
        }
      }
    });
  }
  
  cancel(): void {
    this.editingId = undefined;
    this.editCache = { text: '', author: '', source: '' };
  }

  remove(id: number): void {
    const quote = this.quotes.find(q => q.id === id);
    
    // Check ownership before attempting delete
    if (quote && !this.isMyQuote(quote)) {
      alert('Du kan endast radera dina egna citat.');
      return;
    }

    if (!confirm('Radera citat?')) return;
    
    this.api.delete(id).subscribe({
      next: () => {
        console.log('[MyQuotes] deleted quote:', id);
        this.quotes = this.quotes.filter(x => x.id !== id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[MyQuotes] error deleting quote', err);
        if (err.status === 403) {
          alert('Du har inte behörighet att radera detta citat.');
        }
      }
    });
  }
}