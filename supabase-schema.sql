-- Invoices table for the Freelance Invoice Generator
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for listing invoices in reverse chronological order
create index if not exists idx_invoices_created_at on invoices (created_at desc);

-- Auto-update updated_at on row modification
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger invoices_updated_at
  before update on invoices
  for each row
  execute function update_updated_at();
