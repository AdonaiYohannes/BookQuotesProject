import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  ValidationErrors,
  AbstractControl,
  FormGroup
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';

function matchPasswords(ctrl: AbstractControl): ValidationErrors | null {
  const pw = ctrl.get('Password')?.value;
  const cpw = ctrl.get('ConfirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
}

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  form!: FormGroup;
  error?: string;
  success?: string;

  constructor(
    private fb: FormBuilder,
    private api: AuthService,
    private router: Router
  ) {

    this.form = this.fb.group(
      {
        UserName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
        Email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
        Password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
        ConfirmPassword: ['', [Validators.required]]
      },
      { validators: matchPasswords }
    );
  }


  submit() {
    console.log('[Register] submit() called. form.valid =', this.form.valid, 'value =', this.form.value);

    if (this.form.invalid) {
      console.warn('[Register] form invalid, marking all as touched.');
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value;
    console.log('[Register] sending payload', payload);

    // src/app/components/register/register.ts

    this.api.register(payload).subscribe({
      next: (_res: any) => {
        console.log('[Register] success');
        this.success = 'Konto skapat! Du kan nu logga in.';
        this.router.navigate(['/login']);
    },
    error: (err: any) => {
      const msg = (err?.error ?? '').toString();
      if (err.status === 409) {
        if (msg.includes('Username')) {
          this.form.get('UserName')?.setErrors({ taken: true });
        } else if (msg.includes('Email')) {
          this.form.get('Email')?.setErrors({ taken: true });
        }
      }
      this.error = msg || 'Registreringen misslyckades.';
    }
  });
  }
  get f() { return this.form.controls; }
}
