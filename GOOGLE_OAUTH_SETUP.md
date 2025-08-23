# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your AI Movie Recommender app using Supabase.

## Prerequisites

- A Supabase project (already set up)
- A Google Cloud Console account
- Your app running on a domain (localhost for development)

## Step 1: Google Cloud Console Setup

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click on the project dropdown at the top
   - Either create a new project or select an existing one
   - Note: You can use the same project for multiple apps

3. **Enable Required APIs**
   - Go to "APIs & Services" > "Library"
   - Search for and enable:
     - Google+ API (or Google Identity API)
     - Google People API (optional, for profile info)

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" for public apps
   - Fill in required fields:
     - App name: "AI Movie Recommender" (or your preferred name)
     - User support email: Your email
     - Developer contact email: Your email
   - Add scopes: `../auth/userinfo.email`, `../auth/userinfo.profile`
   - Save and continue

5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Name: "AI Movie Recommender Web Client"
   - Authorized redirect URIs:
     - For development: `http://localhost:3000/auth/callback`
     - For production: `https://yourdomain.com/auth/callback`
   - Click "Create"
   - **Important**: Copy the Client ID and Client Secret

## Step 2: Supabase Configuration

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Open your project dashboard

2. **Configure Google Provider**
   - Navigate to "Authentication" > "Providers"
   - Find "Google" in the list and click to expand
   - Toggle "Enable sign in with Google"
   - Enter your Google OAuth credentials:
     - Client ID: (from Google Cloud Console)
     - Client Secret: (from Google Cloud Console)
   - Set redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Click "Save"

## Step 3: Environment Variables

1. **Update your `.env.local` file**:
   ```bash
   # Your existing variables...
   
   # Supabase configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Restart your development server**:
   ```bash
   npm run dev
   ```

## Step 4: Database Schema (Already Done)

The database schema in `supabase-schema.sql` includes:
- User profiles table with automatic creation on signup
- Proper RLS policies for Google OAuth users
- Triggers for profile creation

## Step 5: Testing

1. **Test Google Login**:
   - Open your app in the browser
   - Click "Sign In" or "Get Started"
   - Click "Continue with Google"
   - Complete the Google OAuth flow
   - You should be redirected back to your app and logged in

2. **Verify Profile Creation**:
   - Check your Supabase dashboard
   - Go to "Table Editor" > "profiles"
   - You should see a new profile created for the Google user

## Production Deployment

When deploying to production:

1. **Update Google Cloud Console**:
   - Add your production domain to authorized redirect URIs
   - Example: `https://yourdomain.com/auth/callback`

2. **Update Supabase**:
   - No changes needed, Supabase handles production automatically

3. **Environment Variables**:
   - Ensure all environment variables are set in your hosting platform
   - Vercel, Netlify, etc. have environment variable sections in their dashboards

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**:
   - Ensure the redirect URI in Google Cloud Console exactly matches what Supabase is sending
   - Check for trailing slashes, http vs https, etc.

2. **"Client ID not found" error**:
   - Verify the Client ID is correctly entered in Supabase
   - Ensure there are no extra spaces or characters

3. **Users not redirected after login**:
   - Check the callback page is working (`/auth/callback`)
   - Verify the redirect URL in the AuthContext is correct

4. **Profile not created**:
   - Check if the database trigger is working
   - Verify RLS policies allow profile creation
   - Check Supabase logs for errors

### Debug Steps:

1. **Check browser network tab** for failed requests
2. **Check Supabase logs** in the dashboard
3. **Check browser console** for JavaScript errors
4. **Verify environment variables** are loaded correctly

## Security Notes

- Never commit your `.env.local` file to version control
- Use different Google OAuth clients for development and production
- Regularly rotate your Supabase service role key
- Monitor authentication logs in Supabase dashboard

## Features Enabled

With this setup, users can:
- Sign in with Google OAuth
- Have profiles automatically created
- Access all authenticated features (movie lists, saved movies)
- Use both email/password and Google authentication interchangeably
