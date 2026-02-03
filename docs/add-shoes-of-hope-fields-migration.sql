-- Migration to add Shoes of Hope form fields to submissions table
-- Adds support for 8 new fields:
-- - Child grade in fall
-- - Shoe gender selection
-- - Girl and boy shoe sizes
-- - Underwear gender selection
-- - Girls and boys underwear sizes
-- - Comments for Shoes of Hope requests
-- Also adds has_siblings field for conditional sibling information

-- Sibling conditional field
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS has_siblings text;

-- Shoes of Hope fields
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS child_grade_fall text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS shoe_gender text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS girl_shoe_size text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS boy_shoe_size text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS underwear_gender text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS girls_underwear_size text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS boys_underwear_size text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS shoes_of_hope_comments text;

-- Add index for commonly queried shoe size field
CREATE INDEX IF NOT EXISTS idx_submissions_child_grade_fall ON submissions(child_grade_fall);

-- Update table comment to document schema version
COMMENT ON TABLE submissions IS 'Form submissions table - Updated with Shoes of Hope fields (v2.1)';
