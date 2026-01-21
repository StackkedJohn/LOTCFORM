-- Migration: Add neon_service_id column to submissions table
-- Run this in your Supabase SQL Editor if you already have the submissions table

-- Add the neon_service_id column
alter table submissions add column if not exists neon_service_id text;

-- Create index for performance
create index if not exists idx_submissions_neon_service on submissions(neon_service_id);

-- Add comment
comment on column submissions.neon_service_id is 'Neon CRM Service_c custom object record ID';
