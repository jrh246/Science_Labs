CREATE TABLE staff_permissions (key text PRIMARY KEY,label text NOT NULL,description text NOT NULL);
INSERT INTO staff_permissions(key,label,description) VALUES
 ('metrics.traffic.read','View web traffic','View aggregate public-page and lab traffic.'),
 ('metrics.business.read','View business metrics','View aggregate customer, workspace, subscription, and payment metrics.'),
 ('metrics.operations.read','View service operations','View aggregate email and drafting-job health.'),
 ('staff.manage','Manage staff access','Define roles and grant permissions you hold to verified staff accounts.'),
 ('staff.audit.read','View staff audit history','View recorded staff access and role changes.');
CREATE TABLE staff_members (
 user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
 active boolean NOT NULL DEFAULT true,revision integer NOT NULL DEFAULT 1,
 created_by text REFERENCES "user"(id) ON DELETE SET NULL,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE staff_roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),name text NOT NULL,description text NOT NULL DEFAULT '',
 archived boolean NOT NULL DEFAULT false,revision integer NOT NULL DEFAULT 1,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX staff_role_name ON staff_roles(lower(name));
CREATE TABLE staff_role_permissions (role_id uuid NOT NULL REFERENCES staff_roles(id) ON DELETE CASCADE,permission_key text NOT NULL REFERENCES staff_permissions(key),PRIMARY KEY(role_id,permission_key));
CREATE TABLE staff_member_roles (user_id text NOT NULL REFERENCES staff_members(user_id) ON DELETE CASCADE,role_id uuid NOT NULL REFERENCES staff_roles(id),PRIMARY KEY(user_id,role_id));
CREATE TABLE staff_audit_log (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),actor_id text REFERENCES "user"(id) ON DELETE SET NULL,
 action text NOT NULL,target_id text NOT NULL,details jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX staff_audit_recent ON staff_audit_log(created_at DESC);
CREATE TABLE traffic_sessions (
 day date NOT NULL,session_key text NOT NULL,first_seen timestamptz NOT NULL DEFAULT now(),last_seen timestamptz NOT NULL DEFAULT now(),views integer NOT NULL DEFAULT 0,
 PRIMARY KEY(day,session_key)
);
CREATE TABLE traffic_events (
 id uuid PRIMARY KEY,day date NOT NULL,session_key text NOT NULL,page text NOT NULL CHECK(page IN ('library','lab','membership','signup')),
 lab_id text REFERENCES labs(id),source text NOT NULL CHECK(source IN ('direct','search','social','other')),
 device text NOT NULL CHECK(device IN ('phone','tablet','desktop')),created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX traffic_events_day ON traffic_events(day,page,lab_id);
CREATE TABLE billing_invoices (
 invoice_id text PRIMARY KEY,organization_id uuid NOT NULL REFERENCES organizations(id),currency text NOT NULL,livemode boolean NOT NULL,
 amount_paid bigint NOT NULL CHECK(amount_paid>=0),status text NOT NULL,paid_at timestamptz,updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE billing_refunds (
 refund_id text PRIMARY KEY,organization_id uuid NOT NULL REFERENCES organizations(id),currency text NOT NULL,livemode boolean NOT NULL,
 amount bigint NOT NULL CHECK(amount>=0),status text NOT NULL,created_at timestamptz NOT NULL,updated_at timestamptz NOT NULL DEFAULT now()
);
