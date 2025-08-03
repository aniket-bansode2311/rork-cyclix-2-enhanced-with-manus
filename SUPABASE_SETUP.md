# Supabase Setup Instructions

Follow these detailed steps to set up Supabase for your period tracking app.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign up"
3. Sign up with your email or GitHub account
4. Verify your email if required

## Step 2: Create a New Project

1. Once logged in, click "New Project"
2. Choose your organization (or create one if it's your first project)
3. Fill in the project details:
   - **Name**: `period-tracker` (or any name you prefer)
   - **Database Password**: Create a strong password and save it securely
   - **Region**: Choose the region closest to your users
4. Click "Create new project"
5. Wait for the project to be created (this takes 1-2 minutes)

## Step 3: Get Your Project Credentials

1. Once your project is ready, go to **Settings** → **API**
2. You'll see your project credentials:
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **Project API Keys**: Copy the `anon public` key (NOT the service_role key)

## Step 4: Update Your .env File

1. Open the `.env` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_RORK_API_BASE_URL=https://wxilyhqbzznp6l5l6eg8s.rork.com
```

**Example with real values:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://yidbacjocafyedshxhre.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpZGJhY2pvY2FmeWVkc2h4aHJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMjMwMTUsImV4cCI6MjA2ODY5OTAxNX0.Q2ZYfQHePHQV6XDur1pO582JRP6_MJ52ucIPgzBiQ0U
EXPO_PUBLIC_RORK_API_BASE_URL=https://wxilyhqbzznp6l5l6eg8s.rork.com
```

**⚠️ IMPORTANT**: 
- Replace `your-project-id` with your actual Supabase project ID
- Replace `your_anon_key_here` with your actual anon key
- Keep the `EXPO_PUBLIC_RORK_API_BASE_URL` as shown (this is your backend URL)
- Make sure there are no extra spaces or quotes around the values

## Step 5: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` from your project
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- All necessary tables (profiles, cycles, period_logs, symptom_logs)
- Row Level Security policies
- Indexes for performance
- Triggers for automatic timestamps

## Step 6: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add your development URLs:
   - `http://localhost:8081` (for Expo development)
   - `exp://localhost:19000` (for Expo Go)
   - Your production domain when you deploy

3. Under **Redirect URLs**, add the same URLs as above

4. **Email Templates** (Optional):
   - Customize the email templates for signup confirmation and password reset
   - Go to **Authentication** → **Email Templates**

## Step 7: Test the Connection

1. Start your Expo development server:
   ```bash
   npm run start
   ```

2. Try to register a new account in your app
3. Check the **Authentication** → **Users** tab in Supabase to see if the user was created
4. Try logging in with the same credentials

## Step 8: Enable Email Confirmation (Recommended)

1. Go to **Authentication** → **Settings**
2. Under **User Signups**, toggle **Enable email confirmations**
3. This prevents users from logging in without verifying their email

## Troubleshooting

### Common Issues:

**1. "Invalid email or password" error:**
- Make sure you're using the correct credentials
- Check if email confirmation is enabled and the user has verified their email
- Verify your Supabase URL and anon key are correct

**2. "Failed to fetch" error:**
- Check your internet connection
- Verify the Supabase URL is correct
- Make sure your project is not paused (free tier projects pause after inactivity)

**3. RLS (Row Level Security) errors:**
- The schema includes proper RLS policies
- Make sure you ran the complete `supabase-schema.sql`
- Check that users are authenticated before accessing protected data

**4. Environment variables not loading:**
- Make sure the `.env` file is in your project root (same level as package.json)
- Restart your Expo development server after changing `.env`
- Environment variables must start with `EXPO_PUBLIC_` to be accessible in the app
- Check that there are no syntax errors in your `.env` file (no quotes, no extra spaces)

**5. "Missing Supabase environment variables" error:**
- This means your `.env` file is not being loaded properly
- Verify the file is named exactly `.env` (not `.env.txt` or similar)
- Make sure you've restarted the development server
- Check that the environment variables are exactly as shown in the example

### Checking Your Setup:

1. **Database Tables**: Go to **Table Editor** and verify you see:
   - profiles
   - cycles  
   - period_logs
   - symptom_logs

2. **Authentication**: Go to **Authentication** → **Users** to see registered users

3. **API Logs**: Go to **Logs** → **API** to see API requests and any errors

## Security Notes

- Never commit your `.env` file to version control
- The `anon` key is safe to use in client-side code
- Never use the `service_role` key in client-side code
- Row Level Security policies ensure users can only access their own data

## Next Steps

After completing this setup:
1. Test user registration and login
2. Try logging period data
3. Verify data appears in the Supabase dashboard
4. Test the app on different devices using Expo Go

## Support

If you encounter issues:
1. Check the Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
2. Check the Expo documentation: [https://docs.expo.dev](https://docs.expo.dev)
3. Look at the browser console and Expo logs for error messages