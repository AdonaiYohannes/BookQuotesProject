import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  form!: FormGroup;
  error?: string;

  constructor(
    private fb: FormBuilder,
    private api: AuthService,
    private router: Router
  ) {

    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

submit() {
  const payload = {
    UserName: this.form.value.username,
    Password: this.form.value.password
  };

  this.api.login(payload).subscribe({
    next: (res: any) => {
      const tok = res?.token ?? res?.Token;
      if (!tok) {
        console.error('[Login] Missing token in response:', res);
        this.error = 'Inloggning misslyckades: saknar token från servern.';
        return;
      }
      this.api.token = tok;
      console.log('[Login] token saved, length=', tok.length);
      this.router.navigate(['/']);
    },
    error: (_err: any) => {
      this.error = 'Fel användarnamn eller lösenord.';
    }
  });
}}
