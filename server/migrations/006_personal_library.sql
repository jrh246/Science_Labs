CREATE TABLE lab_favorites (
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  lab_id text NOT NULL REFERENCES labs(id),created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id,lab_id)
);
ALTER TABLE runtime_grants ADD COLUMN practice boolean NOT NULL DEFAULT false;
CREATE TABLE practice_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  lab_id text NOT NULL REFERENCES labs(id),release_id text NOT NULL REFERENCES releases(id),
  storage jsonb NOT NULL DEFAULT '{}',report jsonb,revision integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(user_id,lab_id,release_id)
);
