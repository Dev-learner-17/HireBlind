-- Schema placeholder for HireBlind audit logging.
-- Add table definitions for audit_logs and any future persistence here.-- Enable required extension (for UUID)
create extension if not exists "pgcrypto";

-- =========================
-- TABLE: audit_logs
-- =========================
create table if not exists audit_logs (
    id uuid primary key default gen_random_uuid(),
    action_type varchar(50) not null,
    timestamp timestamptz default current_timestamp,
    details jsonb not null
);

-- =========================
-- INDEXES
-- =========================
create index if not exists idx_audit_logs_action 
on audit_logs(action_type);

create index if not exists idx_audit_logs_time 
on audit_logs(timestamp);

-- =========================
-- ENABLE RLS
-- =========================
alter table audit_logs enable row level security;

-- =========================
-- CLEAN OLD POLICIES
-- =========================
drop policy if exists "Allow inserts only" on audit_logs;
drop policy if exists "Allow insert for all" on audit_logs;
drop policy if exists "Allow insert" on audit_logs;
drop policy if exists "Deny updates" on audit_logs;
drop policy if exists "Deny deletes" on audit_logs;
drop policy if exists "No update" on audit_logs;
drop policy if exists "No delete" on audit_logs;

-- =========================
-- POLICIES
-- =========================

-- Allow inserts (for anon role / backend using anon key)
create policy "Allow insert"
on audit_logs
for insert
to anon
with check (true);

-- Block updates (immutable logs)
create policy "No update"
on audit_logs
for update
to anon
using (false);

-- Block deletes (append-only)
create policy "No delete"
on audit_logs
for delete
to anon
using (false);

-- =========================
-- OPTIONAL: READ ACCESS
-- =========================
-- Uncomment if needed

-- create policy "Allow read"
-- on audit_logs
-- for select
-- to anon
-- using (true);

-- =========================
-- COMMENT
-- =========================
comment on table audit_logs is 
'EU AI Act compliance log. Append-only. Contains NO candidate PII.';