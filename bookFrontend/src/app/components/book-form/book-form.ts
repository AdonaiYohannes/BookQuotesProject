import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../Services/book.service';

@Component({
  standalone: true,
  selector: 'app-book-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-form.html',
  styleUrl: './book-form.css'
})
export class BookFormComponent implements OnInit {
  id?: number;
  title = 'Ny bok';

  // declare first; initialize later
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: BookService
  ) {
    // initialize here so fb is defined
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(120)]],
      author: ['', [Validators.required, Validators.maxLength(80)]],
      published: ['']
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id = +id;
      this.title = 'Redigera bok';
      this.api.get(this.id).subscribe(b => this.form.patchValue(b));
    }
  }

  submit() {
    const value = this.form.value;

    const payload = {
      title: value.title,
      author: value.author,
      // if published is empty string, send null
      published: value.published && value.published !== '' ? value.published : null
    };

    const obs = this.id
      ? this.api.update(this.id, payload)
      : this.api.create(payload);

    obs.subscribe({
      next: () => this.router.navigate(['/']),
      error: err => {
        console.error('Failed to save book', err);
      }
    });
  }
}
