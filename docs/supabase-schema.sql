-- Create submissions table
create table submissions (
  -- Primary identifiers
  id uuid primary key default gen_random_uuid(),
  submission_id text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Neon CRM IDs (for sync)
  neon_caregiver_id text,
  neon_social_worker_id text,
  neon_service_id text,

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
create index idx_submissions_neon_service on submissions(neon_service_id);
create index idx_submissions_updated_at on submissions(updated_at);
create index idx_submissions_submission_id on submissions(submission_id);

-- Enable Row Level Security (RLS)
alter table submissions enable row level security;

-- Create policy for service role (full access)
create policy "Service role has full access"
  on submissions
  for all
  to service_role
  using (true)
  with check (true);

-- Create policy for authenticated users (read only)
create policy "Authenticated users can read submissions"
  on submissions
  for select
  to authenticated
  using (true);

-- Add trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_submissions_updated_at
  before update on submissions
  for each row
  execute function update_updated_at_column();
