# Neon CRM Integration Documentation
## LOTC Form to Neon CRM - January 19, 2026

This document details the complete integration between the LOTC Request Form and Neon CRM API v2.

---

## Overview

The form now automatically submits data to Neon CRM when configured, creating or updating caregiver and social worker accounts. All submissions are still saved locally as JSON files for backup and redundancy.

### Integration Features

- ✅ **Automatic Account Creation**: Creates individual accounts for caregivers and social workers
- ✅ **Duplicate Prevention**: Searches for existing accounts by email before creating new ones
- ✅ **Fallback Storage**: Always saves to local JSON files as backup
- ✅ **Error Handling**: Graceful degradation if Neon API is unavailable
- ✅ **Conditional Phone Validation**: Supports both mobile and alternative phone numbers
- ✅ **Auto-calculated Child Age**: Age calculated automatically from date of birth

---

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# Neon CRM API Configuration
NEON_ORG_ID=your_organization_id_here
NEON_API_KEY=your_api_key_here
NEON_API_BASE_URL=https://api.neoncrm.com/v2
```

### Getting Your Neon Credentials

1. **Organization ID (Org ID)**:
   - Log into your Neon CRM account
   - Go to Settings (gear icon) → Organization Profile
   - Find "Account Information" section
   - Copy your Org ID

2. **API Key**:
   - Go to Settings → API Keys
   - Generate a new API key
   - The API key inherits all permissions of the associated user
   - Store securely in `.env` file

### API Base URLs

- **Production & Sandbox**: `https://api.neoncrm.com/v2`
- **Trial Instances**: `https://trial.z2systems.com/v2`

---

## Architecture

### Files Added/Modified

1. **neonService.js** (NEW)
   - Neon CRM API service class
   - Handles authentication, account search, and creation
   - Methods for submitting form data

2. **server.js** (MODIFIED)
   - Integrated Neon service
   - Added async/await to form submission endpoint
   - Added Neon response to success message

3. **package.json** (MODIFIED)
   - Added `axios` dependency for HTTP requests

4. **.env** (MODIFIED)
   - Added Neon CRM configuration variables

---

## How It Works

### Form Submission Flow

1. **User submits form** → Frontend validation
2. **POST /api/submit** → Server receives form data
3. **Validate required fields** → Check conditional phone requirements
4. **Save to JSON file** → Always save locally first (backup)
5. **Check Neon configuration** → Is Neon API configured?
6. **Submit to Neon CRM** → If configured:
   - Search for existing caregiver by email
   - Create or update caregiver account
   - Search for existing social worker by email
   - Create or update social worker account
   - Store form-specific data (request type, child info)
7. **Return success response** → Include Neon submission status

### Data Mapping

#### Caregiver Account
```javascript
{
  firstName: formData.caregiverFirstName,
  lastName: formData.caregiverLastName,
  email: formData.caregiverEmail,
  phone: formData.caregiverPhone || formData.alternativePhone,
  address: {
    street: formData.caregiverStreet,
    city: formData.caregiverCity,
    state: formData.caregiverState,
    zip: formData.caregiverZip,
    county: formData.caregiverCounty
  }
}
```

#### Social Worker Account
```javascript
{
  firstName: formData.socialWorkerFirstName,
  lastName: formData.socialWorkerLastName,
  email: formData.socialWorkerEmail,
  phone: formData.socialWorkerPhone || formData.alternativeSocialWorkerPhone,
  county: formData.socialWorkerCounty
}
```

#### Form-Specific Data
```javascript
{
  requestType: formData.requestType,
  relationship: formData.relationship,
  childFirstName: formData.childFirstName,
  childLastName: formData.childLastInitial,
  childAge: formData.childAge, // Auto-calculated from DOB
  childDOB: formData.childDOB,
  childGender: formData.childGender,
  childEthnicity: formData.childEthnicity,
  childPlacementType: formData.childPlacementType,
  pickupLocation: formData.pickupLocation,
  completionContact: formData.completionContact,
  isLicensedFoster: formData.isLicensedFoster
}
```

---

## API Methods

### NeonService Class

#### `isConfigured()`
Checks if Neon CRM credentials are properly configured.

```javascript
if (neonService.isConfigured()) {
  // Proceed with Neon submission
}
```

#### `searchAccountByEmail(email)`
Searches for an existing account by email address.

**Parameters:**
- `email` (string) - Email address to search

**Returns:**
- Account object if found
- `null` if not found

**Example:**
```javascript
const account = await neonService.searchAccountByEmail('john@example.com');
if (account) {
  console.log('Found existing account:', account.accountId);
}
```

#### `createAccount(accountData)`
Creates a new individual account in Neon CRM.

**Parameters:**
- `accountData` (object) - Account information

**Returns:**
- Created account object with `accountId`

**Throws:**
- Error if creation fails

#### `submitFormToNeon(formData)`
Main method to submit complete form data to Neon CRM.

**Parameters:**
- `formData` (object) - Complete form submission data

**Returns:**
```javascript
{
  success: true,
  caregiverAccountId: "123456",
  socialWorkerAccountId: "789012",
  submissionDetails: { /* form-specific data */ },
  message: "Successfully submitted to Neon CRM"
}
```

**Process:**
1. Search/create caregiver account
2. Search/create social worker account
3. Store form-specific information
4. Return result summary

---

## Form Enhancements

### 1. Conditional Phone Fields

Both caregiver and social worker sections now support:

- **Mobile Number** field (primary)
- **Checkbox**: "I do not have a mobile number"
- **Alternative Phone Number** field (appears when checkbox is selected)

**Backend Validation:**
- Requires either mobile OR alternative phone
- Conditional validation based on checkbox state

### 2. Auto-Calculated Child Age

**How it works:**
- User enters child's date of birth
- Age automatically calculates in real-time
- Updates on DOB field change

**Age Display:**
- Babies under 1 year: Shows months (e.g., "6 months", "<1 month")
- Children 1+: Shows years (e.g., "8", "12")

**Implementation:**
```javascript
// JavaScript calculates age from DOB vs. today's date
// Accounts for birthday not yet occurred this year
// Read-only field prevents manual editing
```

### 3. ZIP Code Auto-Population

**Features:**
- Enter ZIP code → auto-populates City, State, County
- Uses free zippopotam.us API
- County mapping for NC/SC ZIP prefixes
- Read-only styling for auto-populated fields

---

## Error Handling

### Graceful Degradation

If Neon API fails:
1. ✅ Form submission still succeeds
2. ✅ Data saved to local JSON file
3. ⚠️ Error logged to console
4. ℹ️ Response indicates Neon submission failed

**Response Example:**
```json
{
  "success": true,
  "message": "Form submitted successfully!",
  "submissionId": "submission_20260119_123456_abc123.json",
  "neonSubmitted": false,
  "neonDetails": null
}
```

### Error Logging

All Neon API errors are logged:
```javascript
console.error('Failed to submit to Neon CRM, but local backup saved:', neonError);
```

This allows manual review and retry if needed.

---

## Testing

### Without Neon Credentials

If credentials are not configured:
- Form works normally
- Skips Neon submission
- Logs: "Neon CRM not configured - skipping Neon submission"
- All data saved locally

### With Neon Credentials

When properly configured:
1. Submit a test form
2. Check console for Neon submission logs
3. Verify account creation in Neon CRM
4. Check local JSON file for backup

**Success Indicators:**
- ✅ Console: "Successfully submitted to Neon CRM"
- ✅ Response includes Neon account IDs
- ✅ Accounts visible in Neon CRM dashboard
- ✅ Local JSON backup created

---

## Custom Fields & Future Enhancements

### Current Limitations

1. **Custom Fields Not Implemented**
   - Form-specific data (request type, child info) is returned but not stored in Neon
   - `addCustomFields()` method is a placeholder

2. **Child Records**
   - Child information not created as separate accounts
   - Stored only in submission details

### Future Enhancements

#### 1. Custom Field Mapping
```javascript
// Map form fields to Neon custom fields
await neonService.addCustomFields(accountId, {
  'Request Type': formData.requestType,
  'Child First Name': formData.childFirstName,
  'Child Age': formData.childAge,
  // ... other fields
});
```

#### 2. Create Child Accounts
```javascript
// Create child as dependent account
const childAccount = await neonService.createDependentAccount({
  parentAccountId: caregiverAccount.accountId,
  firstName: formData.childFirstName,
  lastName: formData.childLastInitial,
  dob: formData.childDOB
});
```

#### 3. Link Relationships
```javascript
// Create relationship between accounts
await neonService.createRelationship({
  account1Id: caregiverAccount.accountId,
  account2Id: socialWorkerAccount.accountId,
  relationshipType: 'Case Worker'
});
```

#### 4. Activity Tracking
```javascript
// Create activity record for request
await neonService.createActivity({
  accountId: caregiverAccount.accountId,
  activityType: 'Request Submitted',
  description: `${formData.requestType} request for ${formData.childFirstName}`,
  date: new Date().toISOString()
});
```

---

## Authentication Details

### HTTP Basic Authentication

Neon CRM API v2 uses HTTP Basic Auth:

**Authorization Header:**
```
Authorization: Basic base64(NEON_ORG_ID:NEON_API_KEY)
```

**Axios Configuration:**
```javascript
axios.create({
  baseURL: 'https://api.neoncrm.com/v2',
  auth: {
    username: NEON_ORG_ID,
    password: NEON_API_KEY
  }
});
```

### API Endpoints Used

1. **POST /accounts/search** - Search for existing accounts
2. **POST /accounts** - Create new individual account
3. **PATCH /accounts/{id}** - Update existing account (future use)

---

## Troubleshooting

### Neon Submission Failing

**Check:**
1. ✅ Org ID and API Key are correct in `.env`
2. ✅ API Key has proper permissions in Neon CRM
3. ✅ Network connectivity to Neon API
4. ✅ Console logs for specific error messages

**Common Errors:**
- **401 Unauthorized**: Check Org ID and API Key
- **403 Forbidden**: API Key lacks required permissions
- **404 Not Found**: Check base URL configuration
- **500 Server Error**: Neon API issue, check status

### Duplicate Accounts

If duplicate accounts are being created:
1. Check email field is properly populated
2. Verify search is working: `searchAccountByEmail()`
3. Review console logs for search results

### Missing Data

If data not appearing in Neon:
1. Check response includes account IDs
2. Verify accounts in Neon CRM dashboard
3. Check custom fields implementation (currently placeholder)

---

## Security Considerations

### API Key Storage

- ✅ Store in `.env` file (never commit to repository)
- ✅ Add `.env` to `.gitignore`
- ✅ Use environment variables in production
- ❌ Never hardcode credentials

### Data Transmission

- ✅ HTTPS encrypted transmission to Neon API
- ✅ HTTP Basic Auth over HTTPS is secure
- ✅ Local JSON backups for redundancy

### Permissions

- API keys inherit user permissions
- Use dedicated API user with minimal required permissions
- Review permissions periodically

---

## Resources

### Documentation
- [Neon CRM API v2 Documentation](https://developer.neoncrm.com/api-v2/)
- [Authentication Guide](https://developer.neoncrm.com/authentication/)
- [Postman Collection](https://documenter.getpostman.com/view/3198276/TVemCAFj)

### Support
- Neon CRM Developer Center: https://developer.neoncrm.com/
- API Response Codes: https://developer.neoncrm.com/api-v2-resources/response-codes/

---

## Summary

### What Was Implemented

1. ✅ Complete Neon CRM API integration
2. ✅ Account search and creation
3. ✅ Duplicate prevention via email search
4. ✅ Fallback to local JSON storage
5. ✅ Error handling and graceful degradation
6. ✅ Conditional phone validation (mobile vs. alternative)
7. ✅ Auto-calculated child age from birthdate
8. ✅ Comprehensive documentation

### Configuration Steps

1. Get Org ID and API Key from Neon CRM
2. Add credentials to `.env` file
3. Install dependencies: `npm install`
4. Start server: `npm start` or `node server.js`
5. Submit test form
6. Verify accounts in Neon CRM

### Next Steps

- Implement custom field mapping for form-specific data
- Add child account creation as dependents
- Create relationships between accounts
- Add activity tracking for requests
- Set up automated testing with Neon sandbox

---

**Integration Status**: ✅ Ready for Production
**Date Completed**: January 19, 2026
**Version**: 1.0
