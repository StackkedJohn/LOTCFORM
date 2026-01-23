-- Migration: Add child_last_name column to submissions table
-- Run this in your Supabase SQL Editor if you already have the submissions table

-- Add the child_last_name column after child_first_name
alter table submissions add column if not exists child_last_name text;

-- For existing records, if they have a child_last_initial, use that as the last name
-- (This is a one-time data migration)
update submissions
set child_last_name = child_last_initial
where child_last_name is null and child_last_initial is not null;

-- Add comment
comment on column submissions.child_last_name is 'Child full last name (not just initial)';
