-- 最小管理后台：管理员邮箱白名单表
create table if not exists public.admin_whitelist (
  email text primary key,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now()
);

alter table public.admin_whitelist enable row level security;
