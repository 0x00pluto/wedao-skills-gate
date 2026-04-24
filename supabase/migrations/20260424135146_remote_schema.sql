drop extension if exists "pg_net";


  create table "public"."companies" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "enterprise_key" text not null,
    "expiry_at" timestamp with time zone not null
      );


alter table "public"."companies" enable row level security;


  create table "public"."company_skills" (
    "company_id" uuid not null,
    "skill_id" text not null
      );


alter table "public"."company_skills" enable row level security;


  create table "public"."skills" (
    "id" text not null,
    "name" text not null,
    "version" text not null,
    "description" text,
    "tags" text[] not null default '{}'::text[],
    "updated_at" date
      );


alter table "public"."skills" enable row level security;

CREATE UNIQUE INDEX companies_enterprise_key_key ON public.companies USING btree (enterprise_key);

CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (id);

CREATE UNIQUE INDEX company_skills_pkey ON public.company_skills USING btree (company_id, skill_id);

CREATE UNIQUE INDEX skills_pkey ON public.skills USING btree (id);

alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";

alter table "public"."company_skills" add constraint "company_skills_pkey" PRIMARY KEY using index "company_skills_pkey";

alter table "public"."skills" add constraint "skills_pkey" PRIMARY KEY using index "skills_pkey";

alter table "public"."companies" add constraint "companies_enterprise_key_key" UNIQUE using index "companies_enterprise_key_key";

alter table "public"."company_skills" add constraint "company_skills_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."company_skills" validate constraint "company_skills_company_id_fkey";

alter table "public"."company_skills" add constraint "company_skills_skill_id_fkey" FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE RESTRICT not valid;

alter table "public"."company_skills" validate constraint "company_skills_skill_id_fkey";

grant delete on table "public"."companies" to "anon";

grant insert on table "public"."companies" to "anon";

grant references on table "public"."companies" to "anon";

grant select on table "public"."companies" to "anon";

grant trigger on table "public"."companies" to "anon";

grant truncate on table "public"."companies" to "anon";

grant update on table "public"."companies" to "anon";

grant delete on table "public"."companies" to "authenticated";

grant insert on table "public"."companies" to "authenticated";

grant references on table "public"."companies" to "authenticated";

grant select on table "public"."companies" to "authenticated";

grant trigger on table "public"."companies" to "authenticated";

grant truncate on table "public"."companies" to "authenticated";

grant update on table "public"."companies" to "authenticated";

grant delete on table "public"."companies" to "service_role";

grant insert on table "public"."companies" to "service_role";

grant references on table "public"."companies" to "service_role";

grant select on table "public"."companies" to "service_role";

grant trigger on table "public"."companies" to "service_role";

grant truncate on table "public"."companies" to "service_role";

grant update on table "public"."companies" to "service_role";

grant delete on table "public"."company_skills" to "anon";

grant insert on table "public"."company_skills" to "anon";

grant references on table "public"."company_skills" to "anon";

grant select on table "public"."company_skills" to "anon";

grant trigger on table "public"."company_skills" to "anon";

grant truncate on table "public"."company_skills" to "anon";

grant update on table "public"."company_skills" to "anon";

grant delete on table "public"."company_skills" to "authenticated";

grant insert on table "public"."company_skills" to "authenticated";

grant references on table "public"."company_skills" to "authenticated";

grant select on table "public"."company_skills" to "authenticated";

grant trigger on table "public"."company_skills" to "authenticated";

grant truncate on table "public"."company_skills" to "authenticated";

grant update on table "public"."company_skills" to "authenticated";

grant delete on table "public"."company_skills" to "service_role";

grant insert on table "public"."company_skills" to "service_role";

grant references on table "public"."company_skills" to "service_role";

grant select on table "public"."company_skills" to "service_role";

grant trigger on table "public"."company_skills" to "service_role";

grant truncate on table "public"."company_skills" to "service_role";

grant update on table "public"."company_skills" to "service_role";

grant delete on table "public"."skills" to "anon";

grant insert on table "public"."skills" to "anon";

grant references on table "public"."skills" to "anon";

grant select on table "public"."skills" to "anon";

grant trigger on table "public"."skills" to "anon";

grant truncate on table "public"."skills" to "anon";

grant update on table "public"."skills" to "anon";

grant delete on table "public"."skills" to "authenticated";

grant insert on table "public"."skills" to "authenticated";

grant references on table "public"."skills" to "authenticated";

grant select on table "public"."skills" to "authenticated";

grant trigger on table "public"."skills" to "authenticated";

grant truncate on table "public"."skills" to "authenticated";

grant update on table "public"."skills" to "authenticated";

grant delete on table "public"."skills" to "service_role";

grant insert on table "public"."skills" to "service_role";

grant references on table "public"."skills" to "service_role";

grant select on table "public"."skills" to "service_role";

grant trigger on table "public"."skills" to "service_role";

grant truncate on table "public"."skills" to "service_role";

grant update on table "public"."skills" to "service_role";


