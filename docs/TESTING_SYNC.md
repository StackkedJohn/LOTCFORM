# Testing Supabase + Neon Sync Integration

## Prerequisites

- Supabase project configured with schema
- Neon CRM account with API access
- Both webhook endpoints configured
- Environment variables set

## Test 1: Form Submission Flow

### Steps:
1. Start local server: `npm run dev`
2. Open form: http://localhost:3000
3. Fill out and submit form
4. Check console logs for:
   - "Form submission saved: submission_*"
   - "Successfully submitted to Neon CRM"
   - "Successfully submitted to Supabase"

### Expected Results:
- JSON file in `submissions/`
- New row in Supabase `submissions` table
- Neon IDs populated in Supabase row
- Both accounts created in Neon CRM

### Verify:
```bash
# Check Supabase
# Go to Supabase dashboard → Table Editor → submissions
# Verify new row with correct data and Neon IDs

# Check Neon CRM
# Search for caregiver/social worker by email
# Verify accounts exist
```

## Test 2: Neon → Supabase Sync

### Steps:
1. Find a caregiver account in Neon CRM (from Test 1)
2. Update the phone number or email
3. Trigger webhook manually or wait for Neon webhook
4. Check webhook endpoint logs

### Expected Results:
- Webhook received at `/api/neon-webhook`
- Console log: "Syncing Neon account {id} to Supabase..."
- Supabase record updated with new data
- `updated_at` and `last_synced_at` timestamps updated

### Manual Webhook Test:
```bash
curl -X POST http://localhost:3000/api/neon-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "account.updated",
    "accountId": "123456",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "data": {
      "firstName": "Updated",
      "lastName": "Name",
      "email": "updated@example.com",
      "phone": "555-9999"
    }
  }'
```

## Test 3: Supabase → Neon Sync

### Steps:
1. Go to Supabase dashboard → Table Editor
2. Find a submission row
3. Update caregiver phone or email
4. Check webhook fires (Database → Webhooks → History)
5. Check `/api/supabase-webhook` logs

### Expected Results:
- Webhook triggered automatically
- Console log: "Syncing Supabase record {id} to Neon..."
- Neon account updated (verify in Neon CRM)

### Manual Webhook Test:
```bash
curl -X POST http://localhost:3000/api/supabase-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "UPDATE",
    "table": "submissions",
    "record": {
      "id": "uuid-here",
      "neon_caregiver_id": "123456",
      "caregiver_first_name": "Updated",
      "caregiver_phone": "555-8888",
      "updated_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    },
    "old_record": {
      "caregiver_phone": "555-7777"
    }
  }'
```

## Test 4: Conflict Resolution (Last Write Wins)

### Steps:
1. Note a submission's current `updated_at` timestamp
2. Send webhook with OLDER timestamp
3. Verify data is NOT updated
4. Send webhook with NEWER timestamp
5. Verify data IS updated

### Expected Results:
- Old timestamp: "Skipping sync - local is newer"
- New timestamp: Record updated successfully

## Test 5: Graceful Degradation

### Test Neon Failure:
1. Set invalid `NEON_API_KEY` in `.env`
2. Submit form
3. Verify: JSON saved, Neon fails, Supabase succeeds
4. Response: `neonSubmitted: false, supabaseSubmitted: true`

### Test Supabase Failure:
1. Set invalid `SUPABASE_URL` in `.env`
2. Submit form
3. Verify: JSON saved, Neon succeeds, Supabase fails
4. Response: `neonSubmitted: true, supabaseSubmitted: false`

## Monitoring Sync Status

### Check Sync Status in Supabase:
```sql
SELECT
  submission_id,
  sync_status,
  last_synced_at,
  sync_error,
  updated_at
FROM submissions
ORDER BY updated_at DESC
LIMIT 10;
```

### Find Sync Errors:
```sql
SELECT *
FROM submissions
WHERE sync_status = 'error'
OR sync_error IS NOT NULL;
```

## Production Testing Checklist

- [ ] Form submission creates records in all three locations
- [ ] Neon IDs are captured in Supabase
- [ ] Neon updates trigger Supabase updates
- [ ] Supabase updates trigger Neon updates
- [ ] Timestamp comparison prevents infinite loops
- [ ] Webhooks handle errors gracefully
- [ ] Form succeeds even if sync fails
- [ ] All environment variables configured in Vercel
- [ ] Webhook URLs configured correctly
- [ ] Webhook signatures verified (if implemented)
