# Authentication Setup Guide

This project uses Supabase for authentication with support for:
- Email/Password authentication
- Google OAuth
- Email verification (OTP)
- Password reset functionality

## Setup Instructions

### 1. Supabase Configuration

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings → API in your Supabase dashboard
3. Copy your Project URL and anon public key
4. Create a `.env` file in the root directory (copy from `.env.example`)
5. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Google OAuth Setup (Optional)

1. Go to Authentication → Providers in your Supabase dashboard
2. Enable Google provider
3. Follow Supabase's guide to set up Google OAuth
4. Add your Google OAuth credentials in Supabase

### 3. Email Configuration

1. Go to Authentication → Settings in your Supabase dashboard
2. Configure your email templates
3. Set up custom SMTP (recommended for production)

## Features

### Authentication Pages

- **Login Page** (`/pages/login`): Email/password and Google login
- **Signup Page** (`/pages/signup`): User registration with email verification
- **OTP Verification** (`/pages/otp-verification`): Email verification flow
- **Forgot Password** (`/pages/forgot-password`): Password reset functionality

### Protected Routes

All dashboard routes are protected and require authentication:
- `/` - Dashboard home
- `/pages/dashboard` - Main dashboard
- `/pages/history` - History page
- `/pages/upload-data` - Data upload
- `/pages/message-generation` - Message generation
- `/pages/segmentation-results` - Segmentation results
- `/pages/Settings` - Settings page

### Authentication Context

The `AuthContext` provides:

```jsx
const {
  user,           // Current user object
  session,        // Current session
  loading,        // Loading state
  signUp,         // Sign up with email/password
  signIn,         // Sign in with email/password
  signInWithGoogle, // Google OAuth
  signOut,        // Sign out
  resendConfirmation, // Resend email verification
  resetPassword,  // Send password reset email
  updatePassword  // Update user password
} = useAuth();
```

### Components

- **ProtectedRoute**: Wraps components that require authentication
- **AuthError**: Displays authentication errors
- **AuthContext**: Manages authentication state

## User Flow

### Registration Flow
1. User fills signup form
2. Creates account with Supabase
3. Redirected to OTP verification page
4. Email verification link sent
5. User clicks link to verify email
6. Can then login normally

### Login Flow
1. User enters credentials
2. Supabase validates credentials
3. Checks email verification status
4. Redirects to dashboard if authenticated

### Google OAuth Flow
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth
3. Google returns to app
4. Automatically logged in

## Error Handling

The system handles various authentication errors:
- Invalid credentials
- Unverified email
- Network errors
- OAuth failures

## Security Features

- Email verification required for new accounts
- Secure password requirements
- Session management
- Protected routes
- Automatic token refresh

## Development

Install dependencies:
```bash
npm install @supabase/supabase-js
```

The authentication is fully integrated with your existing UI components and maintains the current design system.
