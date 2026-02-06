# CLAUDE.md - Light on the Children Form Project

## Project Overview
Online form submission system for Light on the Children (LOTC) nonprofit that integrates with Neon CRM and Supabase. Supports multiple request types: Bags of Hope, Shoes of Hope, General Request, Birthday, Life Box, and Just Like You.

## Critical Architecture

### Dual Server Architecture
- **Local dev:** `server.js` runs on port 3000
- **Production:** `api/submit.js` runs as Vercel serverless function
- **CRITICAL:** These files must have identical validation logic - they diverge easily during development
- When updating validation, always update both files simultaneously

### Data Flow
1. Form submission → `server.js` (local) or `api/submit.js` (production)
2. Save to `submissions/*.json` (backup)
3. Submit to Neon CRM API (creates accounts + Service_c record)
4. Submit to Supabase (stores with Neon IDs for sync)

### Field Name Conventions
- **Frontend (HTML):** camelCase (e.g., `childFirstName`, `caregiverPhone`)
- **Backend validation:** camelCase (matches form field names)
- **Database (Supabase):** snake_case (e.g., `child_first_name`, `caregiver_phone`)
- **Mapping:** Done in `supabaseService.js` `insertSubmission()` method

## Key Files

### Form & Frontend
- `index.html` - Single-page form with conditional logic (~2700 lines)
  - Lines 888-899: Request Type dropdown
  - Lines 2389-2520: Request type conditional logic
  - Lines 2520-2625: Conditional field event listeners

### Backend Services
- `server.js` - Local Express server, validation lines 49-108
- `api/submit.js` - Vercel serverless function, validation lines 26-85
- `neonService.js` - Neon CRM API integration (v1 + v2)
- `supabaseService.js` - Supabase client and field mapping

### Database
- `docs/add-all-new-fields-migration.sql` - Added 46 fields for full form coverage
- `docs/add-shoes-of-hope-fields-migration.sql` - Added 9 fields for Shoes of Hope
- `docs/SUPABASE_FIELD_AUDIT.md` - Complete field mapping documentation

## Common Patterns

### Adding a New Conditional Field
1. **HTML:** Add field with `class="hidden"` wrapper and unique ID
2. **JavaScript:** Add event listener that toggles `classList` and `required` attribute
3. **Backend:** Add to `requiredFields.push()` with conditional logic in both `server.js` AND `api/submit.js`
4. **Database:** Create migration SQL with `ALTER TABLE submissions ADD COLUMN IF NOT EXISTS`
5. **Mapping:** Add to `supabaseService.js` in the submission object
6. **Test:** Submit form and verify field appears in Supabase

### Gender-Based Conditional Fields (Pattern)
```javascript
// HTML: Show girl/boy options based on gender radio selection
document.getElementById('genderField').addEventListener('change', function() {
    if (this.value === 'Girl') {
        girlGroup.classList.remove('hidden');
        girlField.required = true;
        boyGroup.classList.add('hidden');
        boyField.required = false;
    } // ... reverse for Boy
});
```

### Backend Validation Pattern
```javascript
// Add to both server.js and api/submit.js
if (formData.requestType === 'Shoes of Hope') {
    requiredFields.push('childGradeFall', 'shoeGender', 'underwearGender');
    if (formData.shoeGender === 'Girl') {
        requiredFields.push('girlShoeSize');
    }
}
```

### Smart Location Discovery (Map Feature)
**Purpose:** "View Nearest Locations on Map" uses different strategies based on user type

**Social Workers:**
- **Primary:** ZIP code geocoding (more precise)
- **Fallback:** County centroid coordinates from `countyCoordinates` lookup
- **Reason:** Social workers don't enter full addresses, only county/ZIP

**Caregivers & Others:**
- **Strategy:** Full address geocoding (street, city, state, ZIP)
- **Reason:** Caregivers provide complete address for accurate location

**Implementation (index.html ~line 2894):**
```javascript
if (relationship === 'DSS Social Worker') {
    // Try ZIP first, fallback to county centroid
    if (socialWorkerZip) {
        coords = await geocodeAddress(`${socialWorkerZip}, ${state}`);
    }
    if (!coords && socialWorkerCounty) {
        coords = countyCoordinates[socialWorkerCounty];
    }
} else {
    // Use full address
    coords = await geocodeAddress(`${street}, ${city}, ${state} ${zip}`);
}
```

**Validation:**
- Social workers: Requires ZIP OR county (flexible)
- Caregivers: Requires complete address (all fields)

## Testing

### Local Testing
- Start server: `npm run dev` (uses nodemon) or `node server.js` (no auto-restart)
- Form URL: `http://localhost:3000/index.html`
- API endpoint: `http://localhost:3000/api/submit`
- **NOTE:** Nodemon auto-restart can interrupt async Supabase operations - use `node server.js` for critical testing

### Test Submissions
- Saved to `submissions/submission_YYYYMMDD_HHMMSS_*.json`
- Contains full form data with timestamp
- Useful for debugging field mapping issues

### Verifying End-to-End
1. Check console logs for Neon CRM account IDs
2. Check console logs for Supabase insert success
3. Query Supabase table to verify all fields saved
4. Check Neon CRM to verify Service_c record created

### Direct API Testing
```bash
# More reliable than browser automation for testing
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

## Database Schema

### Supabase Table: `submissions`
- 75+ columns covering all form fields
- Uses snake_case naming
- All fields nullable except: `id`, `submission_id`, `created_at`, `updated_at`
- Stores Neon CRM IDs: `neon_caregiver_id`, `neon_social_worker_id`, `neon_service_id`

### Running Migrations
1. Create migration file in `docs/` directory
2. Log into Supabase dashboard
3. Navigate to SQL Editor
4. Copy/paste migration SQL
5. Run migration
6. Verify columns created with `\d submissions` or check table schema

## Gotchas

### Server.js vs API/Submit.js Sync
- These files easily diverge during development
- Always check both files when updating validation
- If local works but production fails (or vice versa), check for divergence

### Supabase Field Mapping
- Missing fields in `supabaseService.js` mapping silently fail to save
- Use `docs/SUPABASE_FIELD_AUDIT.md` to verify all fields mapped
- Test new fields by checking Supabase table after submission

### Conditional Validation
- Frontend `required` attribute must match backend validation
- Easy to miss updating backend when adding frontend fields
- Pattern: `if (formData.x) { requiredFields.push('y') }`

### Life Box Special Handling
- Life Box requests skip ALL caregiver validation (regardless of child age)
- Backend checks: `const isLifeBox = formData.requestType === 'Life Box'`
- Required fields: childPhone, childEmail
- Auto-populates: childPlacementType = "Age 18 or more"
- Function renamed from `checkLifeBox18Plus()` to `checkLifeBox()` to reflect all ages

### Database Schema Cache
- Supabase caches schema - new columns may not be immediately available
- Error message: "Could not find the 'column_name' column in the schema cache"
- Solution: Wait a few seconds or restart Supabase connection

## Form Fields by Request Type

### All Request Types (Base Fields)
- Request Type, Relationship, Pickup Date/Time/Location
- Social Worker: Name, contact, county
- Child: Name, age, DOB, gender, ethnicity, placement type, custody county
- **Exception:** Caregiver information NOT required for Life Box requests

### Bags of Hope
- Caregiver: Name, contact, address
- Clothing sizes: shirt, pants, socks/shoes, undergarments, diapers

### Shoes of Hope
- Caregiver: Name, contact, address
- Child grade in fall
- Shoe gender → girl/boy shoe sizes
- Underwear gender → girl/boy underwear sizes
- Comments

### Life Box
- **NO Caregiver information required** (regardless of child's age)
- Child contact: Phone number, email address (required)
- Placement type auto-populated to "Age 18 or more"
- Designed for youth transitioning out of foster care

### General Request
- Caregiver: Name, contact, address
- Sub-type: Bed, Bedding, Luggage, Car Seat, Stroller, High Chair, Pack & Play, Other
- Bed reason (if sub-type is Bed)
- Additional information

### Conditional Fields
- Person Completing Form (if relationship = Other)
- Group Home info (if placement type = Foster - Group Home)
- Licensing Agency (if licensed foster = Yes)
- Sibling details (if has siblings = Yes)

## Environment Variables
```
NEON_ORG_ID=
NEON_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PORT=3000
```

## Recent Changes (Last Session)

### Shoes of Hope Implementation
- Added "Shoes of Hope" to request type dropdown
- Implemented 8 new fields with gender-based conditional logic
- Updated validation in both server.js and api/submit.js
- Created Supabase migration with 8 new columns

### Sibling Conditional Field
- Added "Does child have siblings?" radio field
- Shows/hides sibling names and placement fields
- Updated Supabase schema with `has_siblings` column

### Field Coverage Audit
- Verified all 75+ form fields saving to Supabase
- Created `SUPABASE_FIELD_AUDIT.md` with complete mapping
- Fixed `child_last_name` field (was missing from schema)

## Next Steps / Known Issues
- `neonService.js` has uncommitted pickup location name simplifications
- Consider consolidating server.js and api/submit.js to reduce duplication
- All migrations need to be run in Supabase before deploying
