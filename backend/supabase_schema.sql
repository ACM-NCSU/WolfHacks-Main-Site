-- Run this in the Supabase SQL editor to create the applications table.
-- Column names match the Application pydantic model in main.py 1:1 so
-- write_to_supabase() can insert model_dump() straight through.

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  first_name text not null,
  middle_name text default '',
  last_name text not null,
  age integer not null,
  email text not null,
  country_of_residence text not null,
  discord_username text not null,
  phone_number text not null,
  university text default '',
  classification text default '',
  major text default '',
  hackathon_participation text not null,
  gender text not null,
  gender_other text default '',
  shirt_size text not null,
  shirt_size_other text default '',
  pronouns text default '',
  pronouns_other text default '',
  dietary_notes text not null,
  dietary_notes_other text default '',
  mlh_code_of_conduct boolean not null,
  mlh_data_authorization boolean not null,
  mlh_marketing_emails boolean not null default false
);

-- RLS stays on by default; the backend writes with the service role key,
-- which bypasses RLS, so no policy is required for inserts to work.
alter table applications enable row level security;
