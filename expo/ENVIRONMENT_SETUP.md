# Environment Variables Setup Guide

## Step 1: Create the .env file

A `.env` file has been created in your project root. You need to replace the placeholder values with your actual Supabase credentials.

## Step 2: Get Your Supabase Credentials

1. Go to your Supabase dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (looks like `https://abcdefghijklmnop.supabase.co`)
   - **Project API Keys** → **anon public** key (NOT the service_role key)

## Step 3: Update Your .env File

Open the `.env` file in your project root and replace the placeholder values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-anon-key
EXPO_PUBLIC_RORK_API_BASE_URL=https://wxilyhqbzznp6l5l6eg8s.rork.com
```

**Example of what it should look like:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2NTQzMiwiZXhwIjoyMDE0MzQxNDMyfQ.example-signature
EXPO_PUBLIC_RORK_API_BASE_URL=https://wxilyhqbzznp6l5l6eg8s.rork.com
```

## Step 4: Important Notes

- **No spaces** around the `=` sign
- **No quotes** around the values
- **No trailing spaces** at the end of lines
- The file must be named exactly `.env` (with the dot at the beginning)
- The file must be in your project root directory (same level as package.json)

## Step 5: Restart Your Development Server

After updating the `.env` file:

1. **Stop** your current Expo development server (Ctrl+C)
2. **Restart** it with:
   ```bash
   npm run start
   ```

## Step 6: Verify the Setup

1. Start your app
2. Try to navigate to the login screen
3. The error about missing environment variables should be gone

## Troubleshooting

### Still getting the error?

1. **Check file location**: Make sure `.env` is in the same folder as `package.json`
2. **Check file name**: It should be `.env` exactly (not `.env.txt` or `env`)
3. **Check syntax**: No spaces around `=`, no quotes around values
4. **Restart completely**: Stop Expo server, close terminal, reopen and restart
5. **Clear cache**: Run `npx expo start --clear` to clear cache

### How to check if variables are loaded:

Add this temporary code to any component to test:

```javascript
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Found' : 'Missing');
```

If you see the actual values in the console, your environment variables are working.

### Common Mistakes:

❌ **Wrong:**
```env
EXPO_PUBLIC_SUPABASE_URL = "https://example.supabase.co"
SUPABASE_URL=https://example.supabase.co
```

✅ **Correct:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://example.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

## Security Note

- The `.env` file is already in `.gitignore` so it won't be committed to version control
- Only use the `anon` key, never the `service_role` key in client-side code
- The `EXPO_PUBLIC_` prefix makes variables available in your app bundle