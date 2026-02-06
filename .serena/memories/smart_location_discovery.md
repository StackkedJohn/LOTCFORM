# Smart Location Discovery Enhancement (2026-02-05)

## Overview
Enhanced the "View Nearest Locations on Map" feature to use different location strategies based on user type (Social Worker vs. Caregiver).

## Problem Solved
- **Caregivers** have full addresses → map should use exact address
- **Social Workers** only have county/ZIP → map should work without full address
- Previous implementation: Used county centroid for SW, but user requested ZIP-based approach

## Solution: Hybrid Location Strategy

### For Social Workers
**Two-tier approach:**
1. **Primary**: ZIP code geocoding (more precise)
2. **Fallback**: County centroid from `countyCoordinates` lookup
3. **Validation**: Requires ZIP OR county (flexible)

**Benefits:**
- ZIP provides better accuracy than county centroid
- County fallback ensures it always works
- No failures if ZIP geocoding has issues

### For Caregivers & "Other"
**Strategy**: Full address geocoding
- Uses complete address: street, city, state, ZIP
- Most accurate location method
- Validation requires all address fields

## Implementation Details

### Location: `index.html` ~line 2894
Function: `openMapModal()`

### Code Pattern
```javascript
if (relationship === 'DSS Social Worker') {
    const socialWorkerZip = document.getElementById('socialWorkerZip').value;
    const socialWorkerCounty = document.getElementById('socialWorkerCounty').value;

    // Validate: need ZIP or county
    if (!socialWorkerZip && !socialWorkerCounty) {
        alert('Please enter ZIP or select county first.');
        return;
    }

    // Strategy 1: Try ZIP geocoding (more precise)
    if (socialWorkerZip) {
        const state = socialWorkerCounty.includes('SC') ? 'SC' : 'NC';
        coords = await geocodeAddress(`${socialWorkerZip}, ${state}`);
    }

    // Strategy 2: Fallback to county centroid
    if (!coords && socialWorkerCounty) {
        coords = countyCoordinates[socialWorkerCounty];
    }
    
} else {
    // Caregivers: Use full address
    coords = await geocodeAddress(`${street}, ${city}, ${state} ${zip}`);
}
```

### State Detection
Smart state detection for social workers:
- Checks if county contains "SC" → uses South Carolina
- Otherwise defaults to "NC" (North Carolina)
- Improves geocoding accuracy

## User Experience

### Social Worker Flow
1. Fills out social worker section (county + ZIP)
2. Clicks "View Nearest Locations on Map"
3. System tries ZIP first (if available)
4. Falls back to county centroid if needed
5. Always succeeds if either field is filled

### Caregiver Flow
1. Fills out complete address
2. Clicks "View Nearest Locations on Map"
3. System geocodes exact address
4. Requires all address fields

## Error Handling

### Social Workers
- Missing both ZIP and county: "Please enter ZIP or select county"
- ZIP geocoding fails: Silent fallback to county centroid
- County not in lookup: "Could not determine location"

### Caregivers
- Incomplete address: "Please complete the caregiver's address first"
- Geocoding fails: "Could not find address. Please check and try again"

## Technical Benefits

1. **Precision**: ZIP code is more accurate than county centroid
2. **Reliability**: Fallback ensures feature always works
3. **Flexibility**: Either ZIP or county is acceptable
4. **UX**: No confusing errors, smooth fallback behavior
5. **Performance**: Fast geocoding with efficient fallback

## Files Modified
- **index.html**: Updated `openMapModal()` function (~40 lines changed)
- **CLAUDE.md**: Added "Smart Location Discovery" pattern documentation

## Testing Scenarios

### Test 1: Social Worker with ZIP
- Relationship: DSS Social Worker
- ZIP: 28803
- County: Buncombe, NC
- Expected: Uses ZIP for geocoding (precise)

### Test 2: Social Worker without ZIP
- Relationship: DSS Social Worker
- ZIP: (empty)
- County: Catawba, NC
- Expected: Uses county centroid fallback

### Test 3: Social Worker with invalid ZIP
- Relationship: DSS Social Worker
- ZIP: 99999 (invalid)
- County: Burke, NC
- Expected: ZIP fails silently, uses county fallback

### Test 4: Caregiver with full address
- Relationship: Caregiver
- Address: 123 Main St, Charlotte, NC 28202
- Expected: Uses full address geocoding (most accurate)

### Test 5: Social Worker with neither ZIP nor county
- Relationship: DSS Social Worker
- ZIP: (empty)
- County: (empty)
- Expected: Alert "Please enter ZIP or select county"

## Future Enhancements
- Add visual indicator showing which method was used (ZIP vs. county)
- Cache geocoded ZIP results to reduce API calls
- Add "Use my location" button for social workers in the field
- Support for city-level geocoding as another fallback option
