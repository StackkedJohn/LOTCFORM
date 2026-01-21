# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Choose a region close to your users
4. Save the project URL and service role key

## 2. Run Database Schema

1. Go to SQL Editor in Supabase dashboard
2. Copy contents of `docs/supabase-schema.sql`
3. Run the SQL to create the table and indexes

## 3. Configure Database Webhooks

1. Go to Database → Webhooks in Supabase dashboard
2. Create new webhook:
   - Name: "Sync to Neon on Update"
   - Table: submissions
   - Events: UPDATE
   - HTTP Request:
     - Method: POST
     - URL: https://your-vercel-app.vercel.app/api/supabase-webhook
     - Headers: Add any auth headers if needed
3. Save webhook

## 4. Update Environment Variables

Add to your `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
SUPABASE_WEBHOOK_SECRET=generate-a-random-secret
```

Add same variables to Vercel environment variables.

## 5. Test the Integration

1. Submit a test form
2. Check Supabase table for new row
3. Verify Neon IDs are populated
4. Test updating a row in Supabase
5. Verify webhook fires (check Vercel logs)

## 6. Configure Neon Webhook (if available)

Check Neon CRM documentation for webhook configuration.

1. Find webhook settings in Neon CRM
2. Add webhook URL: https://your-vercel-app.vercel.app/api/neon-webhook
3. Select events: Account updated
4. Add webhook secret if supported
5. Save configuration
