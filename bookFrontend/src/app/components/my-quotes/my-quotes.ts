import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuoteService, Quote, CreateQuote } from '../../Services/quote.service';
import { AuthService } from '../../Services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-my-quotes',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './my-quotes.html',
  styleUrl: './my-quotes.css'
})
export class MyQuotesComponent implements OnInit {
  quotes: Quote[] = [];
  // Start with all quotes
  showAllQuotes = true;
  isNewQuotePage = false;
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
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('[MyQuotes] ngOnInit');
    this.currentUserId = this.authService.getCurrentUserId();
    console.log('[MyQuotes] currentUserId from AuthService =', this.currentUserId);

    this.updateModeFromUrl();

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.updateModeFromUrl());
  }

  private updateModeFromUrl(): void {
    this.isNewQuotePage = this.router.url.startsWith('/my-quote/new');
    console.log('[MyQuotes] isNewQuotePage =', this.isNewQuotePage, 'url=', this.router.url);

    if (this.isNewQuotePage) {
      // Reset form when entering the "new" page
      this.newQuote = { text: '', author: '', source: '' };
      this.editingId = undefined;
      this.editCache = { text: '', author: '', source: '' };
      return;
    }

    this.fetch();
  }

  fetch(): void {
    const obs = this.showAllQuotes
      ? this.api.getAll()   
      : this.api.getMyQuotes(); 

    console.log('[MyQuotes] fetch – showAllQuotes =', this.showAllQuotes);

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

  setView(showAll: boolean): void {
    if (this.showAllQuotes === showAll) return;
    this.showAllQuotes = showAll;
    console.log('[MyQuotes] setView →', this.showAllQuotes ? 'ALL' : 'MINE');
    this.fetch();
  }

  isMyQuote(quote: Quote): boolean {
    if (this.currentUserId == null) return false;
    const current = Number(this.currentUserId);
    const quoteUserId = Number((quote as any).userId);
    return current === quoteUserId;
  }

  add(): void {
    const text = this.newQuote.text?.trim() ?? '';
    const author = this.newQuote.author?.trim() ?? '';
    const source = this.newQuote.source?.trim() ?? '';

    if (!text) return;

    const payload: CreateQuote = { text, author, source: source || null };

    this.api.create(payload).subscribe({
      next: (q) => {
        console.log('[MyQuotes] created quote:', q);
        this.newQuote = { text: '', author: '', source: '' };

        // If we're on the /my-quote/new page, go back to list page after save
        if (this.isNewQuotePage) {
          this.router.navigateByUrl('/my-quotes');
          return;
        }

        this.fetch();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[MyQuotes] error creating quote', err);
      }
    });
  }

  startEdit(q: Quote): void {
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
