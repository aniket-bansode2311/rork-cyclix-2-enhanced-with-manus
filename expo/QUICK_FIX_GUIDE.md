# Quick Fix for Environment Variables Error

## The Problem
You're getting the "Missing Supabase environment variables" error because either:
1. The `.env` file doesn't have your actual Supabase credentials
2. The environment variables aren't loading properly
3. You haven't restarted the development server after updating `.env`

## The Solution (5 minutes)

### Step 1: Get Your Supabase Credentials
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (or create one if you don't have it)
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (the long string starting with `eyJ...`)

### Step 2: Update the .env File
The `.env` file exists in your project root. Open it and replace the placeholder values:

**Current content (with placeholders):**
```
EXPO_PUBLIC_SUPABASE_URL=https://yidbacjocafyedshxhre.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpZGJhY2pvY2FmeWVkc2h4aHJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMjMwMTUsImV4cCI6MjA2ODY5OTAxNX0.Q2ZYfQHePHQV6XDur1pO582JRP6_MJ52ucIPgzBiQ0U
EXPO_PUBLIC_RORK_API_BASE_URL=https://wxilyhqbzznp6l5l6eg8s.rork.com
```

**Replace with your actual Supabase values:**
```
EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
EXPO_PUBLIC_RORK_API_BASE_URL=https://wxilyhqbzznp6l5l6eg8s.rork.com
```

**⚠️ IMPORTANT**: Keep the `EXPO_PUBLIC_RORK_API_BASE_URL` exactly as shown - only change the Supabase values!

### Step 3: Restart Your Development Server
1. **Stop** your current server (Ctrl+C in terminal)
2. **Start** it again:
   ```bash
   npm run start
   ```

## Don't Have a Supabase Project Yet?

### Quick Supabase Setup (10 minutes):

1. **Create Account**: Go to [supabase.com](https://supabase.com) → Sign up
2. **New Project**: Click "New Project" → Fill in details → Wait 2 minutes
3. **Get Credentials**: Settings → API → Copy URL and anon key
4. **Setup Database**: Go to SQL Editor → Paste the contents of `supabase-schema.sql` → Run
5. **Update .env**: Replace the placeholder values with your real ones
6. **Restart**: Stop and restart your development server

## Still Having Issues?

### Check These Common Problems:
- ✅ `.env` file exists in project root (same folder as `package.json`)
- ✅ No quotes around the values in `.env`
- ✅ No spaces around the `=` sign
- ✅ Development server was restarted after updating `.env`
- ✅ File is named exactly `.env` (not `.env.txt` or similar)
- ✅ You replaced BOTH the URL and the anon key with your actual values
- ✅ Your Supabase project is active (not paused)

### Test Your Setup:
Add this to any component temporarily:
```javascript
console.log('URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Key exists:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
```

If you see "undefined" for either, the environment variables aren't loading.

## Authentication Issues After Setup

If you're getting "Invalid email or password" errors after fixing the environment variables:

1. **Make sure you've set up the database schema**:
   - Go to your Supabase dashboard → SQL Editor
   - Run the complete `supabase-schema.sql` file

2. **Check email confirmation settings**:
   - Go to Authentication → Settings in Supabase
   - If "Enable email confirmations" is ON, users must verify their email first
   - For testing, you can temporarily disable this

3. **Verify user exists**:
   - Go to Authentication → Users in Supabase
   - Check if your test user appears in the list

## Need More Help?
The error will disappear once you have valid Supabase credentials in your `.env` file and restart the server. For detailed setup instructions, see `SUPABASE_SETUP.md`.