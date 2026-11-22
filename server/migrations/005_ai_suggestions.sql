CREATE TABLE teacher_ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),teacher_lab_id uuid NOT NULL REFERENCES teacher_labs(id),
  owner_id text NOT NULL REFERENCES "user"(id),draft_version integer NOT NULL,
  request jsonb NOT NULL,status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','running','complete','failed')),
  result jsonb,error text,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX teacher_ai_suggestions_owner ON teacher_ai_suggestions(owner_id,created_at DESC);
