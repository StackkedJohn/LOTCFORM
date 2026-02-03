-- Migration to add all new form fields to submissions table
-- This adds support for all 75 form fields including:
-- - General Request sub-types and bed reasons
-- - Person completing form details
-- - Caregiver text preferences and middle name
-- - Licensing agency information
-- - Social worker extensions and text preferences
-- - Pickup date/time
-- - Child sibling information and custody county
-- - Group home details
-- - Clothing sizes for Bags of Hope
-- - Form agreements

-- Request information fields
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS general_request_sub_type text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS bed_reason text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS additional_info text;

-- Relationship fields
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS relationship_other text;

-- Person Completing Form fields (when relationship = Other)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS person_completing_first_name text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS person_completing_middle_name text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS person_completing_last_name text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS person_completing_phone text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS person_completing_textable text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS person_completing_email text;

-- Additional Caregiver fields
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS caregiver_middle_name text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS caregiver_no_mobile text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS caregiver_textable text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS know_caregiver_email text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS has_caregiver_info text;

-- Foster/Licensing information
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS licensing_agency text;

-- Additional Social Worker fields
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS has_social_worker_info text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS social_worker_middle_name text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS social_worker_no_mobile text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS social_worker_phone_ext text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS social_worker_can_text text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS social_worker_county_other text;

-- Pickup date/time fields
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS pickup_date date;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS pickup_time text;

-- Additional Child information fields
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS child_last_name text; -- Full last name (not just initial)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS child_nickname text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS child_siblings_names text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS siblings_same_home text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS child_custody_county text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS child_placement_type_other text;

-- Group Home information (when placement type = Group Home)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS group_home_name text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS group_home_phone text;

-- Clothing sizes (for Bags of Hope requests)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS shirt_size text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS pant_size text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS sock_shoe_size text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS undergarment_size text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS diaper_size text;

-- Form agreements
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS agree_to_terms text;

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_submissions_request_type ON submissions(request_type);
CREATE INDEX IF NOT EXISTS idx_submissions_pickup_date ON submissions(pickup_date);
CREATE INDEX IF NOT EXISTS idx_submissions_child_custody_county ON submissions(child_custody_county);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);

-- Add comment to table documenting the schema version
COMMENT ON TABLE submissions IS 'Form submissions table - Updated with all 75 form fields (v2.0)';
