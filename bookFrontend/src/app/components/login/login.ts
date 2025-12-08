import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthResponse, AuthService } from '../../Services/auth.service';

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
    next: (res: AuthResponse) => {
      const tok = res?.token;
      if (!tok) {
        console.error('[Login] Missing token in response:', res);
        this.error = 'Inloggning misslyckades: saknar token från servern.';
        return;
      }

      // Save token and navigate
      this.api.token = tok;
      console.log('[Login] token saved, length=', tok.length);
      //this.router.navigate(['/']);
      // ✅ Save username
      if (res.userName) {
        this.api.setUserName(res.userName);
        console.log('[Login] username saved:', res.userName);
      } else {
      // Fallback: try to extract username from token
        const userNameFromToken = this.api.getUserNameFromToken();
      if (userNameFromToken) {
        this.api.setUserName(userNameFromToken);
        console.log('[Login] username extracted from token:', userNameFromToken);
      } else {
        console.warn('[Login] Could not find username in response or token');
      }
    }
  
      // Navigate to home
      this.router.navigate(['/']);
    },
    error: (err: any) => {
      console.error('[Login] Error:', err);
      this.error = 'Fel användarnamn eller lösenord.';
      }
    });
  }
}
