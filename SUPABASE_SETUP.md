# Supabase Configuration for OTP Email Verification

## 🔧 Required Supabase Settings

### 1. **Authentication Settings**
Go to your Supabase Dashboard → Authentication → Settings

#### Email Templates
- **Enable email confirmation**: ✅ ON
- **Email template for signup confirmation**: Make sure it's configured to send OTP

#### Auth Settings
- **Enable email confirmations**: ✅ ON
- **Enable signup**: ✅ ON  
- **Minimum password length**: 6 characters

### 2. **Email Configuration**
Go to Authentication → Settings → SMTP Settings

#### Option A: Use Supabase Built-in Email (Limited)
- This might not work reliably for OTP codes
- Limited to development/testing

#### Option B: Configure Custom SMTP (Recommended)
- **Enable custom SMTP**: ✅ ON
- **SMTP Host**: Your email provider (e.g., smtp.gmail.com)
- **SMTP Port**: 587 (TLS) or 465 (SSL)
- **SMTP Username**: Your email address
- **SMTP Password**: Your email password or app password
- **SMTP Sender Name**: Your app name
- **SMTP Sender Email**: Your verified sender email

### 3. **OAuth Providers (Google)**
Go to Authentication → Providers → Google

- **Enable Google provider**: ✅ ON
- **Client ID**: Your Google OAuth Client ID
- **Client Secret**: Your Google OAuth Client Secret
- **Redirect URL**: Add these URLs:
  - `http://localhost:5174/pages/dashboard` (development)
  - `https://yourdomain.com/pages/dashboard` (production)

### 4. **Site Configuration**
Go to Authentication → URL Configuration

- **Site URL**: `http://localhost:5174` (development)
- **Redirect URLs**: Add all your callback URLs:
  - `http://localhost:5174/**`
  - `https://yourdomain.com/**`

### 5. **Email Templates**
Go to Authentication → Email Templates

#### Confirm Signup Template
Make sure the template includes the OTP token. The default template should work, but you can customize it:

```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
<p>Or enter this verification code: <strong>{{ .Token }}</strong></p>
```

## 🚀 Testing the Configuration

1. **Visit**: `http://localhost:5174/debug-auth`
2. **Test Connection**: Click "Test Connection" button
3. **Test Signup**: Try signing up with a real email address
4. **Check Email**: Look for OTP code in your email
5. **Verify OTP**: Enter the 6-digit code

## 🐛 Troubleshooting

### Not Receiving Emails?
1. Check your email spam/junk folder
2. Verify SMTP settings in Supabase
3. Make sure email confirmation is enabled
4. Check Supabase logs for email delivery errors

### Google OAuth Not Working?
1. Verify Google OAuth credentials
2. Check redirect URLs are correctly configured
3. Make sure Google Cloud Console has the right callbacks

### OTP Verification Failing?
1. Check if the OTP format is correct (6 digits)
2. Verify the email template includes {{ .Token }}
3. Make sure OTP hasn't expired (usually 1 hour)

## 📧 Recommended Email Providers for SMTP

### Gmail
- Host: `smtp.gmail.com`
- Port: `587`
- Use App Passwords (not your regular password)

### SendGrid
- Host: `smtp.sendgrid.net`
- Port: `587`
- More reliable for production

### AWS SES
- Best for production environments
- Requires verification of sender domains

## 🔍 Debug Steps

1. **Check Console Logs**: Open browser DevTools → Console
2. **Check Network Tab**: Look for failed API requests
3. **Test with Debug Page**: Use `/debug-auth` route
4. **Verify Environment Variables**: Check `.env` file

## ✅ Success Indicators

You'll know it's working when:
- ✅ Signup redirects to OTP verification page
- ✅ Email with 6-digit code is received
- ✅ OTP verification succeeds and logs user in
- ✅ Google OAuth works without OTP
- ✅ Login works without OTP for verified users
