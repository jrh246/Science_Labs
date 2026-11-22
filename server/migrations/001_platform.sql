-- Better Auth's core PostgreSQL schema. Roles are deliberately NOT writable
-- through signup; owner elevation is a separate verified-user CLI operation.
CREATE TABLE "user" (
  id text PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false, image text,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE session (
  id text PRIMARY KEY, "expiresAt" timestamptz NOT NULL, token text NOT NULL UNIQUE,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "ipAddress" text, "userAgent" text, "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX sessions_by_user ON session("userId");
CREATE TABLE account (
  id text PRIMARY KEY, "accountId" text NOT NULL, "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accessToken" text,"refreshToken" text,"idToken" text,"accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,scope text,password text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),"updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX account_user ON account("userId");
CREATE TABLE verification (
  id text PRIMARY KEY,identifier text NOT NULL,value text NOT NULL,"expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),"updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX verification_identifier ON verification(identifier);
CREATE TABLE "rateLimit" (id text PRIMARY KEY,key text NOT NULL UNIQUE,count integer NOT NULL,"lastRequest" bigint NOT NULL);

CREATE TABLE platform_owners (user_id text PRIMARY KEY REFERENCES "user"(id),created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),name text NOT NULL,
  created_by text NOT NULL UNIQUE REFERENCES "user"(id),trial_ends_at timestamptz NOT NULL,
  plan text NOT NULL DEFAULT 'teacher' CHECK(plan IN ('teacher','school')),
  seat_limit integer NOT NULL DEFAULT 1 CHECK(seat_limit BETWEEN 1 AND 10000),
  license_ends_at timestamptz, stripe_customer_id text UNIQUE,stripe_subscription_id text UNIQUE,
  subscription_status text NOT NULL DEFAULT 'none',subscription_ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE organization_members (
  organization_id uuid NOT NULL REFERENCES organizations(id),user_id text NOT NULL REFERENCES "user"(id),
  role text NOT NULL CHECK(role IN ('owner','teacher')),PRIMARY KEY(organization_id,user_id)
);
CREATE TABLE courses (id text PRIMARY KEY,title text NOT NULL,description text NOT NULL DEFAULT '',published boolean NOT NULL DEFAULT false);
CREATE TABLE units (id text PRIMARY KEY,course_id text NOT NULL REFERENCES courses(id),title text NOT NULL,description text NOT NULL DEFAULT '',position integer NOT NULL,published boolean NOT NULL DEFAULT false);
CREATE TABLE releases (
  id text PRIMARY KEY,commit_sha text NOT NULL,manifest jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),
  disabled_at timestamptz,disabled_reason text
);
CREATE TABLE labs (
  id text PRIMARY KEY,unit_id text NOT NULL REFERENCES units(id),title text NOT NULL,summary text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT false,access text NOT NULL DEFAULT 'free' CHECK(access IN ('free','subscription')),
  release_id text REFERENCES releases(id),position integer NOT NULL DEFAULT 0,metadata jsonb NOT NULL DEFAULT '{}'
);
CREATE TABLE publication_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),actor_id text NOT NULL REFERENCES "user"(id),
  kind text NOT NULL CHECK(kind IN ('course','unit','lab','release','license')),entity_id text NOT NULL,
  before_value jsonb NOT NULL,after_value jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,period text NOT NULL DEFAULT '',archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE enrollments (class_id uuid NOT NULL REFERENCES classes(id),user_id text NOT NULL REFERENCES "user"(id),joined_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(class_id,user_id));
CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),token_hash text NOT NULL UNIQUE,email text NOT NULL,
  class_id uuid REFERENCES classes(id),organization_id uuid REFERENCES organizations(id),
  created_by text NOT NULL REFERENCES "user"(id),expires_at timestamptz NOT NULL,accepted_at timestamptz,
  CHECK ((class_id IS NULL)<>(organization_id IS NULL))
);
CREATE TABLE assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),class_id uuid NOT NULL REFERENCES classes(id),
  lab_id text NOT NULL REFERENCES labs(id),release_id text NOT NULL REFERENCES releases(id),
  title text NOT NULL,instructions text NOT NULL DEFAULT '',due_at timestamptz,closed boolean NOT NULL DEFAULT false,
  created_by text NOT NULL REFERENCES "user"(id),created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),assignment_id uuid NOT NULL REFERENCES assignments(id),
  user_id text NOT NULL REFERENCES "user"(id),revision integer NOT NULL DEFAULT 1,
  storage jsonb NOT NULL DEFAULT '{}',report jsonb,status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','returned')),
  updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(assignment_id,user_id)
);
CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),attempt_id uuid NOT NULL REFERENCES attempts(id),
  revision integer NOT NULL,report jsonb NOT NULL,storage jsonb NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),late boolean NOT NULL DEFAULT false,
  UNIQUE(attempt_id,revision)
);
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),submission_id uuid NOT NULL UNIQUE REFERENCES submissions(id),
  reviewer_id text NOT NULL REFERENCES "user"(id),feedback text NOT NULL,score numeric(8,2),max_score numeric(8,2),
  return_for_revision boolean NOT NULL DEFAULT false,updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK((score IS NULL AND max_score IS NULL) OR (score>=0 AND max_score>0 AND score<=max_score))
);
CREATE TABLE runtime_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id text NOT NULL REFERENCES "user"(id),
  release_id text NOT NULL REFERENCES releases(id),lab_id text NOT NULL REFERENCES labs(id),
  assignment_id uuid REFERENCES assignments(id),expires_at timestamptz NOT NULL
);
CREATE INDEX runtime_grants_user ON runtime_grants(user_id,release_id,expires_at);
CREATE TABLE email_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),dedupe_key text NOT NULL UNIQUE,
  recipient text NOT NULL,subject text NOT NULL,html text NOT NULL,status text NOT NULL DEFAULT 'queued',
  provider_id text,attempts integer NOT NULL DEFAULT 0,last_error text,created_at timestamptz NOT NULL DEFAULT now(),sent_at timestamptz
);
CREATE TABLE stripe_events (id text PRIMARY KEY,event_type text NOT NULL,processed_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE platform_rate_limits (bucket text PRIMARY KEY,window_start timestamptz NOT NULL,count integer NOT NULL);
CREATE INDEX assignments_class ON assignments(class_id);
CREATE INDEX attempts_assignment ON attempts(assignment_id);
CREATE INDEX invitations_email ON invitations(email);
CREATE INDEX outbox_pending ON email_outbox(status,created_at);
