# LOTC Form - Gap Analysis
## Apricot Form vs Current Implementation

**Generated**: 2026-02-02
**Purpose**: Identify missing fields and conditional logic needed to match Apricot form functionality

---

## Executive Summary

The current form has **33 user-input fields** covering basic request submission. The Apricot form has significantly more fields for internal tracking, communication logging, and administrative workflows. This analysis identifies what needs to be added to achieve feature parity.

---

## 1. MISSING FIELDS - Public-Facing (User Entry)

### Form Completed By Section
| Apricot Field | Current Form | Status | Priority |
|---------------|--------------|--------|----------|
| Name of Adult Completing the Form (First/Middle/Last) | ❌ Missing | Need to add when Relationship = "Other" | HIGH |
| Phone Number of Adult Completing the Form | ❌ Missing | Need to add when Relationship = "Other" | HIGH |
| Is this number textable? | ❌ Missing | Need to add when Relationship = "Other" | MEDIUM |
| Email of Adult Completing the Form | ❌ Missing | Need to add when Relationship = "Other" | HIGH |
| You chose "Other" as your relationship... (dropdown) | ✅ **Has text field** | Exists as text input; Apricot has dropdown | LOW |

### Caregiver Details
| Apricot Field | Current Form | Status | Priority |
|---------------|--------------|--------|----------|
| Caregiver's Licensing Agency | ❌ Missing | Need to add when licensed foster = "Yes" | HIGH |
| Can the Caregiver receive text messages | ❌ Missing | Need to add (Yes/No dropdown) | MEDIUM |

### Social Worker Details
| Apricot Field | Current Form | Status | Priority |
|---------------|--------------|--------|----------|
| Extension | ✅ Has | Field exists | ✓ |
| Can the Social Worker receive text messages | ✅ Has | Field exists | ✓ |

### Child Details
| Apricot Field | Current Form | Status | Priority |
|---------------|--------------|--------|----------|
| Child's Last Initial | ✅ Has as "Child's Last Name" | Full last name instead of initial | DECISION NEEDED |
| Child's Siblings Names (first name and last initial only) | ❌ Missing | Need to add (text area) | MEDIUM |
| Are child's siblings in the same home as this child? | ❌ Missing | Need to add (Yes/No dropdown) | MEDIUM |
| County that has Custody of child | ❌ Missing | Need to add (county dropdown) | HIGH |

### Group Home Details Section
| Apricot Field | Current Form | Status | Priority |
|---------------|--------------|--------|----------|
| Group Home Name | ❌ Missing | Need entire section | HIGH |
| Group Home Main phone number | ❌ Missing | Need to add | HIGH |

**Trigger**: When Child's Placement Type = "Foster - Group Home placement"

### Child's Clothing Sizes Section
| Apricot Field | Current Form | Status | Priority |
|---------------|--------------|--------|----------|
| Child's Shirt Size | ❌ Missing | Need entire section | CRITICAL |
| Child's Pant Size | ❌ Missing | Need to add | CRITICAL |
| Child's Sock/Shoe Size | ❌ Missing | Need to add | CRITICAL |
| Child's Undergarments Size | ❌ Missing | Need to add | CRITICAL |
| Child's Diaper Size | ❌ Missing | Need to add | CRITICAL |

**Trigger**: When Request Type = "Bags of Hope"

### Bed Request Logic
| Apricot Field | Current Form | Status | Priority |
|---------------|--------------|--------|----------|
| Is this a bed request? (Yes/No) | ✅ **Partially** | Has "Bed" option in General Request Type | REVIEW |
| Reason a bed is needed | ❌ Missing | Need to add dropdown | HIGH |

**Trigger**: When Request Type = "General Request" (Already implemented as sub-type)

---

## 2. MISSING FIELDS - Admin/Internal Only

### These fields are for STAFF USE after submission - NOT user-facing

| Section | Fields | Implementation |
|---------|--------|----------------|
| **BOH Use Only** | Send reminder email, Reminder tracking, etc. | Backend/Admin panel |
| **Communication Log** | Date/Time/Notes (4 entries) | Backend/Admin panel |
| **Interoffice Communication** | Notify dropdowns | Backend/Admin panel |
| **Request Details** | Attach Doc 1-5, Current Location, Estimated Value, Request Status, Date Packed, Request Delivered Date, Request Closed Date, Child Participation, etc. | Backend/Admin panel |
| **Email Triggers** | Confirmation emails, Staff alerts | Backend automation |
| **Shonda Only** | Tutoring surveys, JLY surveys, etc. | Backend/Admin panel |
| **System Fields** | LOTC ID, Linked records, etc. | Backend database |

**Decision**: These should NOT be in the public-facing form. They need a separate admin interface.

---

## 3. MISSING CONDITIONAL LOGIC RULES

### Current Form Has:
✅ General Request → Shows "General Request Type" (Bed/Baby)
✅ General Request OR Just Like You → Shows "Additional Information" textarea
✅ Relationship = "Other" → Shows "Please specify" text field
✅ Child Placement Type = "Other" → Shows "Please specify" text field
✅ Social Worker County = "Other" → Shows "Please specify" text field
✅ Know Caregiver Email = "Yes" → Shows email field
✅ No mobile number checkbox → Shows alternative phone field

### Needs to Add:

#### Rule: Child Placement = Group Home
**Conditions**: Child's Placement Type = "Foster - Group Home placement"
**Actions**:
- Unhide Group Home Details section
- Require Group Home Name field
- Require Group Home Main phone number

#### Rule: Request Type = Birthday
**Conditions**: Request Type = "Birthday"
**Actions**:
- ~~Unhide Pick Up Location field~~ (Already always visible)
- ~~Require Pick Up Location field~~ (Already required)

#### Rule: Request Type = Bags of Hope
**Conditions**: Request Type = "Bags of Hope"
**Actions**:
- ~~Unhide Pick Up Location field~~ (Already always visible)
- ~~Require Pick Up Location field~~ (Already required)
- **Unhide Child's Clothing Sizes section** ← NEED TO ADD
- **Require all clothing size fields** ← NEED TO ADD

#### Rule: Caregiver Licensed = YES
**Conditions**: Is the caregiver a licensed foster parent? = "Yes"
**Actions**:
- Unhide Caregiver's Licensing Agency field
- Require Caregiver's Licensing Agency field

#### Rule: General Request - Bed Sub-Type
**Current**: General Request → Shows sub-type dropdown (Bed/Baby)
**Apricot**: General Request → Shows "Is this a bed request?" (Yes/No)
**If Bed**: → Shows "Reason a bed is needed" dropdown

**Decision**: Current implementation already has "Bed" as a sub-type option. Need to add "Reason a bed is needed" field when Bed is selected.

#### Rule: Relationship = Other
**Conditions**: Relationship = "Other (GAL, case worker, etc.)"
**Actions** (Apricot has these, we're missing):
- Unhide Name of Adult Completing the Form
- Require Name of Adult Completing the Form
- Unhide Phone Number of Adult Completing the Form
- Require Phone Number of Adult Completing the Form
- Unhide "Is this number textable?" field
- Unhide Email of Adult Completing the Form
- Require Email of Adult Completing the Form

---

## 4. FIELD NAMING/STRUCTURE DIFFERENCES

| Concept | Apricot | Current Form | Notes |
|---------|---------|--------------|-------|
| Child's Name | First Name + Last INITIAL only | First Name + Full Last Name | Consider if security/privacy requires only initial |
| Completion Contact | Separate question near request details | In Request Details section | ✓ Same |
| Pickup Location | Appears conditionally | Always visible | Consider making conditional based on request type |
| Licensed Foster logic | Shows Licensing Agency when Yes | Not implemented | Need to add |
| Bed Request | Separate Yes/No question | Part of General Request sub-type | Different approach, both valid |

---

## 5. IMPLEMENTATION PRIORITY MATRIX

### CRITICAL (Do First) ✅
1. **Child's Clothing Sizes Section** - Required for Bags of Hope requests
   - All 5 size fields (Shirt, Pant, Sock/Shoe, Undergarments, Diaper)
   - Show when Request Type = "Bags of Hope"

2. **Bed Request "Reason Needed" Field** - Required for bed sub-type
   - Add dropdown: "Reason a bed is needed"
   - Show when General Request Type = "Bed"

### HIGH Priority (Do Next) 🔥
3. **Group Home Section** - Required for group home placements
   - Group Home Name (dropdown)
   - Group Home Main phone number
   - Show when Placement Type = "Foster - Group Home placement"

4. **Person Completing Form Details** - Required when Relationship = "Other"
   - Name (First/Middle/Last)
   - Phone Number
   - Is this number textable?
   - Email Address

5. **Caregiver Licensing Agency** - Required when foster parent = "Yes"
   - Add Licensing Agency dropdown
   - Show when "Is caregiver licensed foster?" = "Yes"

6. **County that has Custody of child** - Important for tracking
   - Add county dropdown

### MEDIUM Priority (Nice to Have) 📋
7. **Sibling Information**
   - Siblings Names textarea
   - Siblings in same home? (Yes/No)

8. **Can Caregiver receive text messages** - Communication preference
   - Add Yes/No dropdown to Caregiver section

9. **Is this number textable?** - For Person Completing Form
   - Add when Relationship = "Other"

### LOW Priority (Optional) 🎯
10. **Child's Last Name vs Last Initial**
    - Decision: Keep full last name or change to initial only for privacy?

---

## 6. CONDITIONAL LOGIC IMPLEMENTATION CHECKLIST

### JavaScript Changes Needed:

```javascript
// PRIORITY 1: Bags of Hope → Show Clothing Sizes
requestType.onChange() {
  if (value === "Bags of Hope") {
    show('#clothingSizesSection');
    require(['shirtSize', 'pantSize', 'sockShoeSize', 'undergarmentSize', 'diaperSize']);
  } else {
    hide('#clothingSizesSection');
    unrequire(['shirtSize', 'pantSize', 'sockShoeSize', 'undergarmentSize', 'diaperSize']);
  }
}

// PRIORITY 2: Bed → Show Reason Needed
generalRequestSubType.onChange() {
  if (value === "Bed") {
    show('#bedReasonField');
    require('bedReason');
  } else {
    hide('#bedReasonField');
    unrequire('bedReason');
  }
}

// PRIORITY 3: Group Home Placement → Show Group Home Details
childPlacementType.onChange() {
  if (value === "Foster - Group Home placement") {
    show('#groupHomeSection');
    require(['groupHomeName', 'groupHomePhone']);
  } else {
    hide('#groupHomeSection');
    unrequire(['groupHomeName', 'groupHomePhone']);
  }
}

// PRIORITY 4: Relationship Other → Show Person Details
relationship.onChange() {
  if (value === "Other (GAL, case worker, etc.)") {
    show('#personCompletingSection');
    require(['personFirstName', 'personLastName', 'personPhone', 'personEmail']);
  } else {
    hide('#personCompletingSection');
    unrequire(['personFirstName', 'personLastName', 'personPhone', 'personEmail']);
  }
}

// PRIORITY 5: Licensed Foster → Show Agency
isLicensedFoster.onChange() {
  if (value === "Yes") {
    show('#licensingAgencyField');
    require('licensingAgency');
  } else {
    hide('#licensingAgencyField');
    unrequire('licensingAgency');
  }
}
```

---

## 7. BACKEND VALIDATION UPDATES NEEDED

Update `api/submit.js` conditional validation:

```javascript
// Add to conditional required fields logic:

if (formData.requestType === 'Bags of Hope') {
  requiredFields.push('shirtSize', 'pantSize', 'sockShoeSize', 'undergarmentSize', 'diaperSize');
}

if (formData.generalRequestSubType === 'Bed') {
  requiredFields.push('bedReason');
}

if (formData.childPlacementType === 'Foster - Group Home placement') {
  requiredFields.push('groupHomeName', 'groupHomePhone');
}

if (formData.relationship === 'Other (GAL, case worker, etc.)') {
  requiredFields.push('personCompletingFirstName', 'personCompletingLastName',
                     'personCompletingPhone', 'personCompletingEmail');
}

if (formData.isLicensedFoster === 'Yes') {
  requiredFields.push('licensingAgency');
}
```

---

## 8. DROPDOWN OPTIONS NEEDED

### Licensing Agency Options
(Need to research NC/SC foster licensing agencies - likely includes):
- DSS (Department of Social Services)
- Children's Hope Alliance
- Thompson Child & Family Focus
- [Need complete list from client]

### Reason Bed is Needed Options
(Apricot shows dropdown but options not listed - need from client):
- New placement
- Damaged/broken bed
- Age-appropriate bed needed
- [Need complete list from client]

### Group Home Name Options
(Apricot shows dropdown - need complete list from client):
- [Specific group home names in NC/SC service area]

---

## 9. SUMMARY OF WORK REQUIRED

### Fields to Add: **21 new fields**
- 5 clothing size fields
- 2 group home fields
- 4 person completing form fields (when Other)
- 3 sibling fields
- 2 caregiver fields (textable, licensing agency)
- 1 bed reason field
- 1 custody county field
- 1 child last name decision (initial vs full)
- 2 other minor fields

### Conditional Logic Rules to Implement: **5 rules**
1. Bags of Hope → Clothing sizes
2. General Request (Bed) → Reason needed
3. Group Home Placement → Group home details
4. Relationship Other → Person details
5. Licensed Foster → Licensing agency

### Backend Validation Updates: **5 conditional blocks**

### Estimated Implementation Time:
- **Critical Priority**: 4-6 hours
- **High Priority**: 6-8 hours
- **Medium Priority**: 4-6 hours
- **Total**: 14-20 hours for full parity

---

## 10. QUESTIONS FOR CLIENT

1. **Licensing Agency Dropdown**: What are the complete list of licensing agencies?
2. **Reason Bed is Needed**: What are the options for this dropdown?
3. **Group Home Names**: What are the specific group homes in your service area?
4. **Child's Last Name**: Do you want full last name or just last initial for privacy/security?
5. **Admin Fields**: Do you want a separate admin panel for post-submission fields, or should we build them into this form?
6. **Clothing Size Options**: What are the specific size options for each clothing field?
7. **Pickup Location Logic**: Should pickup location be conditional on request type, or always show?

---

## 11. OUT OF SCOPE (Admin Panel Needed)

The following Apricot sections are **NOT** for the public-facing form. They need a separate admin interface:

- ❌ BOH Use Only (reminder emails, tracking)
- ❌ Communication Log (staff notes)
- ❌ Interoffice Communication (staff notifications)
- ❌ Request Details (status, dates, value tracking)
- ❌ Email Triggers (automated emails)
- ❌ Shonda Only (tutoring/survey management)
- ❌ System Fields (LOTC IDs, linked records)
- ❌ File Attachments (5 document upload fields)

These require backend admin functionality separate from the public request form.

---

**Next Steps**: Prioritize which fields/logic to implement first based on business impact.
