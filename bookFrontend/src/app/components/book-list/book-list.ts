import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { BookService, Book } from '../../Services/book.service';

@Component({
  standalone: true,
  selector: 'app-book-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css'
})
export class BookListComponent implements OnInit {
  loading = false;
  books: Book[] = [];
  error?: string;
  private isBrowser: boolean;

  constructor(
    private api: BookService,
    private cdr: ChangeDetectorRef,  // 👈 ADD THIS
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    console.log('[BookList] Component initialized, isBrowser =', this.isBrowser);
    if (this.isBrowser) {
      this.fetch();
    }
  }

  fetch() {
    console.log('[BookList] Fetching books...');
    this.loading = true;
    this.error = undefined;
    this.cdr.detectChanges();

    this.api.getAll().subscribe({
      next: res => {
        console.log('[BookList] Received response:', res);
        this.books = res;
        console.log('[BookList] Number of books:', this.books.length);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('[BookList] Error fetching books', err);
        this.error = 'Kunde inte hämta böcker.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  remove(id: number) {
    if (!confirm('Är du säker att du vill radera boken?')) return;

    this.api.delete(id).subscribe({
      next: () => {
        console.log('[BookList] Deleted book id =', id, '– refetching list');
        this.fetch();
      },
      error: err => {
        console.error('[BookList] Error deleting book', err);
        this.error = 'Kunde inte radera boken.';
        this.cdr.detectChanges();
      }
    });
  }
}