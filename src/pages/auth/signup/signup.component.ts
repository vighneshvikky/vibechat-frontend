import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { GradientButtonComponent } from '../../../core/shared/buttons/gradient-button.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, GradientButtonComponent],
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  submitted = false;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength = {
    score: 0,
    label: '',
    color: '',
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private _authService: AuthService
  ) {}

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
            this.nameValidator,
          ],
        ],
        email: [
          '',
          [Validators.required, Validators.email, this.emailValidator],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(128),
            this.passwordValidator,
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );

    this.signupForm.get('password')?.valueChanges.subscribe((password) => {
      this.calculatePasswordStrength(password || '');
    });

    this.signupForm.get('password')?.valueChanges.subscribe(() => {
      this.signupForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  get f() {
    return this.signupForm.controls;
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const nameRegex = /^[a-zA-Z\s'-]+$/;
    const valid = nameRegex.test(control.value.trim());

    if (!valid) {
      return { invalidName: true };
    }

    const hasLetter = /[a-zA-Z]/.test(control.value);
    if (!hasLetter) {
      return { invalidName: true };
    }

    return null;
  }

  emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const valid = emailRegex.test(control.value.trim());

    if (!valid) {
      return { invalidEmail: true };
    }

    const value = control.value.trim();

    if (value.includes('..')) {
      return { invalidEmail: true };
    }

    if (/^[._%+-]|[._%+-]$/.test(value.split('@')[0])) {
      return { invalidEmail: true };
    }

    return null;
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const errors: ValidationErrors = {};

    if (!/[A-Z]/.test(password)) {
      errors['noUpperCase'] = true;
    }

    if (!/[a-z]/.test(password)) {
      errors['noLowerCase'] = true;
    }

    if (!/[0-9]/.test(password)) {
      errors['noNumber'] = true;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors['noSpecialChar'] = true;
    }

    const commonPasswords = ['password', '12345678', 'qwerty', 'abc123'];
    if (commonPasswords.some((weak) => password.toLowerCase().includes(weak))) {
      errors['commonPassword'] = true;
    }

    if (/(.)\1{2,}/.test(password)) {
      errors['repeatingChars'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  calculatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = { score: 0, label: '', color: '' };
      return;
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    const hasMultipleTypes =
      [
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[!@#$%^&*(),.?":{}|<>]/.test(password),
      ].filter(Boolean).length >= 3;

    if (hasMultipleTypes) score++;

    if (/(.)\1{2,}/.test(password)) score = Math.max(0, score - 1);

    const commonPasswords = ['password', '12345678', 'qwerty', 'abc123'];
    if (commonPasswords.some((weak) => password.toLowerCase().includes(weak))) {
      score = Math.max(0, score - 2);
    }

    const normalizedScore = Math.min(4, Math.max(1, Math.ceil(score / 2)));

    switch (normalizedScore) {
      case 1:
        this.passwordStrength = { score: 1, label: 'Weak', color: '#DC2626' };
        break;
      case 2:
        this.passwordStrength = { score: 2, label: 'Fair', color: '#F59E0B' };
        break;
      case 3:
        this.passwordStrength = { score: 3, label: 'Good', color: '#10B981' };
        break;
      case 4:
        this.passwordStrength = { score: 4, label: 'Strong', color: '#059669' };
        break;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    Object.keys(this.signupForm.controls).forEach((key) => {
      this.signupForm.get(key)?.markAsTouched();
    });

    if (this.signupForm.invalid) {
      console.error('Form validation failed:', this.getFormValidationErrors());
      return;
    }

    const formValue = {
      ...this.signupForm.value,
      name: this.signupForm.value.name.trim(),
      email: this.signupForm.value.email.trim().toLowerCase(),
    };

    console.log('formValue', formValue);

    this.loading = true;
    this._authService.register(formValue).subscribe({
      next: (res) => {
        console.log('res', res);
        this.router.navigate(['/login']);
      },
    });
  }

  getFormValidationErrors() {
    const errors = [];
    Object.keys(this.signupForm.controls).forEach((key) => {
      const control = this.signupForm.get(key);
      if (control && control.errors) {
        errors.push({ field: key, errors: control.errors });
      }
    });

    if (this.signupForm.errors) {
      errors.push({ field: 'form', errors: this.signupForm.errors });
    }

    return errors;
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  hasError(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field && field.errors && (field.touched || this.submitted));
  }


  hasUpperCase(): boolean {
    const password = this.signupForm.get('password')?.value;
    return password && /[A-Z]/.test(password);
  }


  hasLowerCase(): boolean {
    const password = this.signupForm.get('password')?.value;
    return password && /[a-z]/.test(password);
  }

  /**
   * Check if password has number
   */
  hasNumber(): boolean {
    const password = this.signupForm.get('password')?.value;
    return password && /[0-9]/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.signupForm.get('password')?.value;
    return password && /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  hasMinLength(): boolean {
    const password = this.signupForm.get('password')?.value;
    return password && password.length >= 8;
  }

  hasPasswordMismatch(): boolean {
    return !!(
      this.signupForm.errors?.['passwordMismatch'] &&
      (this.signupForm.get('confirmPassword')?.touched || this.submitted)
    );
  }

  getErrorMessage(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    if (!field || !field.errors || (!field.touched && !this.submitted)) {
      return '';
    }

    const errors = field.errors;

    // Full Name errors
    if (fieldName === 'name') {
      if (errors['required']) return 'Full name is required';
      if (errors['minlength']) return 'Name must be at least 3 characters';
      if (errors['maxlength']) return 'Name must not exceed 50 characters';
      if (errors['invalidName'])
        return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Email errors
    if (fieldName === 'email') {
      if (errors['required']) return 'Email is required';
      if (errors['email'] || errors['invalidEmail'])
        return 'Please enter a valid email address';
    }

    // Password errors
    if (fieldName === 'password') {
      if (errors['required']) return 'Password is required';
      if (errors['minlength']) return 'Password must be at least 8 characters';
      if (errors['maxlength']) return 'Password must not exceed 128 characters';
      if (errors['commonPassword'])
        return 'This password is too common. Please choose a stronger password';
      if (errors['repeatingChars']) return 'Avoid using repeating characters';
      if (Object.keys(errors).length > 0)
        return 'Password must meet all requirements';
    }

    // Confirm Password errors
    if (fieldName === 'confirmPassword') {
      if (errors['required']) return 'Please confirm your password';
    }

    // Terms errors
    if (fieldName === 'agreeToTerms') {
      if (errors['required'])
        return 'You must agree to the terms and conditions';
    }

    return '';
  }
}
