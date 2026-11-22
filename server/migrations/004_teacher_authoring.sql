CREATE TABLE teacher_labs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),owner_id text NOT NULL REFERENCES "user"(id),
  base_lab_id text NOT NULL REFERENCES labs(id),base_release_id text NOT NULL REFERENCES releases(id),
  draft jsonb NOT NULL,draft_version integer NOT NULL DEFAULT 1,
  previewed_version integer,published_revision_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX teacher_labs_owner ON teacher_labs(owner_id);
CREATE TABLE teacher_lab_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),teacher_lab_id uuid NOT NULL REFERENCES teacher_labs(id),
  revision integer NOT NULL,content jsonb NOT NULL,content_hash text NOT NULL,
  base_lab_id text NOT NULL REFERENCES labs(id),base_release_id text NOT NULL REFERENCES releases(id),
  published_by text NOT NULL REFERENCES "user"(id),review jsonb NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),UNIQUE(teacher_lab_id,revision)
);
ALTER TABLE teacher_labs ADD CONSTRAINT teacher_labs_published_revision FOREIGN KEY(published_revision_id) REFERENCES teacher_lab_revisions(id);
CREATE FUNCTION keep_teacher_revision_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Published teacher lab revisions cannot be changed'; END;
$$;
CREATE TRIGGER teacher_revision_immutable BEFORE UPDATE OR DELETE ON teacher_lab_revisions FOR EACH ROW EXECUTE FUNCTION keep_teacher_revision_immutable();
ALTER TABLE assignments ADD COLUMN teacher_lab_revision_id uuid REFERENCES teacher_lab_revisions(id);
ALTER TABLE assignments ADD COLUMN teacher_lab_snapshot jsonb;
ALTER TABLE assignments ADD COLUMN publication_state text NOT NULL DEFAULT 'published' CHECK(publication_state IN ('draft','published'));
ALTER TABLE runtime_grants ADD COLUMN teacher_lab_snapshot jsonb;
