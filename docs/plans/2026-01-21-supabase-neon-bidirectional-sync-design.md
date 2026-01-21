# Supabase + Neon CRM Bidirectional Sync Design

**Date:** 2026-01-21
**Status:** Approved for Implementation

## Overview

Integrate Supabase database with the existing LOTC form and Neon CRM integration to enable:
1. Form data storage in Supabase (in addition to JSON and Neon CRM)
2. Near real-time bidirectional sync between Neon CRM and Supabase
3. Last-write-wins conflict resolution

## Requirements

### Functional Requirements
- Form submissions save to Supabase with Neon CRM account IDs
- Changes in Neon CRM sync to Supabase within seconds
- Changes in Supabase sync to Neon CRM within seconds
- Last write wins for conflict resolution (timestamp-based)
- Graceful degradation if either system fails

### Non-Functional Requirements
- Near real-time sync (within seconds via webhooks)
- Best-effort delivery (form submission succeeds even if sync fails)
- No infinite sync loops
- Simple, maintainable code mirroring existing patterns

## Architecture

### System Components

1. **LOTC Form** (existing) - Initial form submission interface
2. **Neon CRM** (existing) - CRM system with webhook capabilities
3. **Supabase** (new) - PostgreSQL database with webhook capabilities
4. **Sync Services** (new) - Orchestration and webhook handlers

### Three Data Flows

#### Flow 1: Initial Form Submission
```
User submits form
    ↓
api/submit.js receives POST
    ↓
Validate form data (existing)
    ↓
Save to JSON file (existing)
    ↓
Submit to Neon CRM → Get account IDs (existing)
    ↓
Submit to Supabase with Neon IDs (NEW)
    ↓
Return response with both statuses
```

#### Flow 2: Neon Update → Supabase
```
User updates account in Neon CRM
    ↓
Neon webhook fires
    ↓
api/neon-webhook.js receives POST
    ↓
syncService.syncNeonToSupabase()
    ↓
Check timestamp (skip if Supabase newer)
    ↓
Update Supabase record
```

#### Flow 3: Supabase Update → Neon
```
User/App updates record in Supabase
    ↓
Supabase database webhook fires
    ↓
api/supabase-webhook.js receives POST
    ↓
syncService.syncSupabaseToNeon()
    ↓
Check timestamp (skip if Neon newer)
    ↓
Update Neon CRM account via API
```

## Database Schema

### Supabase Table: `submissions`

```sql
create table submissions (
  -- Primary identifiers
  id uuid primary key default gen_random_uuid(),
  submission_id text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Neon CRM IDs (for sync)
  neon_caregiver_id text,
  neon_social_worker_id text,

  -- Request information
  request_type text not null,
  relationship text not null,

  -- Caregiver information
  caregiver_first_name text not null,
  caregiver_last_name text not null,
  caregiver_email text,
  caregiver_phone text,
  alternative_phone text,
  caregiver_street text not null,
  caregiver_city text not null,
  caregiver_state text not null,
  caregiver_zip text not null,
  caregiver_county text not null,

  -- Social worker information
  social_worker_first_name text not null,
  social_worker_last_name text not null,
  social_worker_email text not null,
  social_worker_phone text,
  alternative_social_worker_phone text,
  social_worker_county text not null,

  -- Child information
  child_first_name text not null,
  child_last_initial text not null,
  child_age text not null,
  child_dob date not null,
  child_gender text not null,
  child_ethnicity text not null,
  child_placement_type text not null,

  -- Additional fields
  pickup_location text not null,
  completion_contact text not null,
  is_licensed_foster text not null,

  -- Sync metadata
  sync_status text default 'synced',
  last_synced_at timestamptz,
  sync_error text
);

-- Indexes for performance
create index idx_submissions_neon_caregiver on submissions(neon_caregiver_id);
create index idx_submissions_neon_social_worker on submissions(neon_social_worker_id);
create index idx_submissions_updated_at on submissions(updated_at);
```

## Implementation Files

### New Files

#### 1. `supabaseService.js`
Mirrors pattern of existing `neonService.js`.

**Methods:**
- `checkConfiguration()` - Verify env vars exist
- `getClient()` - Initialize Supabase client
- `insertSubmission(formData, neonResult)` - Insert new submission
- `updateSubmission(neonId, updatedData)` - Update existing record
- `getSubmissionByNeonId(neonId, type)` - Query by Neon ID
- `getSubmissionById(submissionId)` - Query by submission_id

**Environment Variables:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

---

#### 2. `syncService.js`
Orchestrates bidirectional sync with conflict resolution.

**Methods:**
- `syncNeonToSupabase(neonAccountId, neonData, timestamp)` - Sync Neon changes to Supabase
- `syncSupabaseToNeon(supabaseRecord, timestamp)` - Sync Supabase changes to Neon
- `shouldSync(localTimestamp, incomingTimestamp)` - Timestamp comparison for conflict resolution
- `mapNeonToSupabase(neonData)` - Field mapping helper
- `mapSupabaseToNeon(supabaseData)` - Field mapping helper

**Conflict Resolution Logic:**
```javascript
shouldSync(localTimestamp, incomingTimestamp) {
  if (!localTimestamp) return true; // No local record
  return new Date(incomingTimestamp) > new Date(localTimestamp);
}
```

---

#### 3. `api/neon-webhook.js`
Vercel serverless function to receive Neon CRM webhooks.

**Endpoint:** `POST /api/neon-webhook`

**Flow:**
1. Verify webhook signature
2. Extract account ID and updated fields
3. Call `syncService.syncNeonToSupabase()`
4. Return 200 OK

**Expected Payload:**
```javascript
{
  "eventType": "account.updated",
  "accountId": "123456",
  "timestamp": "2026-01-21T12:34:56Z",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    // ... updated fields
  }
}
```

**Environment Variables:**
- `NEON_WEBHOOK_SECRET` (for signature verification)

---

#### 4. `api/supabase-webhook.js`
Vercel serverless function to receive Supabase database webhooks.

**Endpoint:** `POST /api/supabase-webhook`

**Flow:**
1. Verify webhook signature
2. Extract submission record and timestamp
3. Call `syncService.syncSupabaseToNeon()`
4. Return 200 OK

**Expected Payload:**
```javascript
{
  "type": "UPDATE",
  "table": "submissions",
  "record": {
    "id": "uuid",
    "neon_caregiver_id": "123456",
    "updated_at": "2026-01-21T12:34:56Z",
    // ... all submission fields
  },
  "old_record": { /* previous values */ }
}
```

**Environment Variables:**
- `SUPABASE_WEBHOOK_SECRET` (for signature verification)

### Modified Files

#### `api/submit.js`
Add Supabase integration after Neon CRM submission.

**Changes:**
```javascript
// After Neon submission (existing)...

// NEW: Submit to Supabase
let supabaseResult = null;
if (supabaseService.isConfigured()) {
  try {
    supabaseResult = await supabaseService.insertSubmission({
      ...formData,
      submissionId: filename,
      neonCaregiverId: neonResult?.caregiverAccountId || null,
      neonSocialWorkerId: neonResult?.socialWorkerAccountId || null
    });
    console.log('Successfully submitted to Supabase:', supabaseResult);
  } catch (supabaseError) {
    console.error('Failed to submit to Supabase:', supabaseError);
  }
}

// Updated response
res.status(200).json({
  success: true,
  message: 'Form submitted successfully!',
  submissionId: filename,
  neonSubmitted: neonResult ? true : false,
  neonDetails: neonResult || null,
  supabaseSubmitted: supabaseResult?.success || false,
  supabaseId: supabaseResult?.data?.id || null
});
```

#### `package.json`
Add Supabase JavaScript client dependency.

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

#### `.env`
Add Supabase and webhook configuration.

```
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Webhook Secrets
NEON_WEBHOOK_SECRET=your-neon-webhook-secret
SUPABASE_WEBHOOK_SECRET=your-supabase-webhook-secret
```

#### `vercel.json`
Add webhook routes.

```json
{
  "routes": [
    {
      "src": "/api/neon-webhook",
      "dest": "/api/neon-webhook.js"
    },
    {
      "src": "/api/supabase-webhook",
      "dest": "/api/supabase-webhook.js"
    }
  ]
}
```

## Error Handling

### Graceful Degradation
- Form submission always saves to JSON (backup)
- Neon failure: logs error, continues to Supabase
- Supabase failure: logs error, form still succeeds
- Webhook failure: logs error, returns 200 to prevent retries

### Sync Loop Prevention
1. **Timestamp Comparison**: Only sync if incoming data is newer
2. **Skip Flag**: Webhook updates can include flag to skip triggering webhooks
3. **Error Logging**: Track sync errors in `submissions.sync_error` field

### Monitoring
- Console logs for all sync operations
- `sync_status` field tracks: 'synced', 'pending', 'error'
- `sync_error` field stores error messages
- `last_synced_at` timestamp for debugging

## Security

### Webhook Authentication
- Verify signatures on all webhook endpoints
- Use environment variables for secrets
- Return 401 for invalid signatures

### API Keys
- Use Supabase service role key (stored in `.env`)
- Never expose keys in client-side code
- Rotate keys periodically

### Data Access
- Webhooks only process authenticated requests
- Vercel serverless functions isolated
- No public database access

## Testing Strategy

### Unit Testing
- Test `supabaseService` methods independently
- Test `syncService` conflict resolution logic
- Test field mapping functions

### Integration Testing
1. **Form Submission Flow**
   - Submit form → verify JSON, Neon, and Supabase records created
   - Test with Neon success and Supabase failure
   - Test with Neon failure and Supabase success

2. **Neon → Supabase Sync**
   - Update account in Neon CRM
   - Trigger webhook manually or via Neon
   - Verify Supabase record updated

3. **Supabase → Neon Sync**
   - Update record in Supabase
   - Trigger webhook via Supabase dashboard
   - Verify Neon account updated

4. **Conflict Resolution**
   - Update same record in both systems
   - Verify last write wins
   - Check no infinite loops

### Manual Testing Steps
1. Configure Supabase project and table
2. Set up environment variables
3. Test form submission end-to-end
4. Configure Neon webhook (if available)
5. Configure Supabase database webhook
6. Test bidirectional sync scenarios
7. Test conflict scenarios with timestamps

## Deployment

### Prerequisites
1. Supabase project created
2. `submissions` table created with schema
3. Database webhooks configured in Supabase
4. Neon webhook configured (if available)
5. Environment variables set in Vercel

### Deployment Steps
1. Install dependencies: `npm install`
2. Test locally: `npm run dev`
3. Deploy to Vercel: `vercel --prod`
4. Configure webhook URLs in Neon and Supabase
5. Test webhooks with sample data

### Rollback Plan
- Remove webhook configurations
- Revert to previous Vercel deployment
- Data remains in Supabase (read-only)
- JSON backups unaffected

## Future Enhancements

### Phase 2 (Optional)
- Separate tables for caregivers, social workers, children (normalized)
- Batch sync for historical data
- Sync status dashboard
- Automated retry for failed syncs
- Webhook retry queue

### Phase 3 (Optional)
- Real-time notifications on sync failures
- Conflict resolution UI for manual review
- Audit log for all sync operations
- Performance metrics and monitoring

## Success Criteria

✅ Form submissions save to Supabase with Neon IDs
✅ Neon updates sync to Supabase within seconds
✅ Supabase updates sync to Neon within seconds
✅ No infinite sync loops
✅ Last write wins for conflicts
✅ Graceful degradation on failures
✅ All data accessible in both systems

## Notes

- Single flat table approach chosen for simplicity
- Synchronous webhook processing for near real-time sync
- Best-effort delivery maintains existing reliability
- Mirrors existing `neonService.js` pattern for consistency
