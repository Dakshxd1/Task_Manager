-- ============================================================
-- TaskFlow v2 — Supabase PostgreSQL Schema
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── ENUMS ───────────────────────────────────────────────────
CREATE TYPE user_role       AS ENUM ('admin', 'member');
CREATE TYPE project_status  AS ENUM ('active', 'on_hold', 'completed', 'archived');
CREATE TYPE task_status     AS ENUM ('todo', 'in_progress', 'review', 'done');
CREATE TYPE task_priority   AS ENUM ('low', 'medium', 'high', 'critical');

-- ── PROFILES ────────────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  avatar_url  TEXT,
  role        user_role NOT NULL DEFAULT 'member',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROJECTS ────────────────────────────────────────────────
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  status      project_status NOT NULL DEFAULT 'active',
  owner_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  deadline    DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ  -- soft delete
);

-- ── PROJECT MEMBERS ─────────────────────────────────────────
CREATE TABLE project_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'member',
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- ── TASKS ────────────────────────────────────────────────────
CREATE TABLE tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  status      task_status     NOT NULL DEFAULT 'todo',
  priority    task_priority   NOT NULL DEFAULT 'medium',
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date    DATE,
  created_by  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position    INTEGER DEFAULT 0,  -- for kanban ordering
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ  -- soft delete
);

-- ── TASK COMMENTS ────────────────────────────────────────────
CREATE TABLE task_comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── TASK ATTACHMENTS ─────────────────────────────────────────
CREATE TABLE task_attachments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name   TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  file_size   INTEGER,
  mime_type   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  entity_type TEXT,   -- 'task' | 'project' | 'comment'
  entity_id   UUID,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── ACTIVITY LOGS ────────────────────────────────────────────
CREATE TABLE activity_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,   -- 'task' | 'project' | 'member'
  entity_id   UUID NOT NULL,
  action      TEXT NOT NULL,   -- 'created' | 'updated' | 'deleted' | 'assigned' | 'status_changed'
  old_value   JSONB,
  new_value   JSONB,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_tasks_project      ON tasks(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_assigned     ON tasks(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_status       ON tasks(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_due_date     ON tasks(due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_created_by   ON tasks(created_by);
CREATE INDEX idx_pm_project         ON project_members(project_id);
CREATE INDEX idx_pm_user            ON project_members(user_id);
CREATE INDEX idx_notif_user_unread  ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_comments_task      ON task_comments(task_id);
CREATE INDEX idx_activity_entity    ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_projects_owner     ON projects(owner_id) WHERE deleted_at IS NULL;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks              ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs      ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_select_all"   ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own"   ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own"   ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- PROJECTS — members can see their projects, admins manage all
CREATE POLICY "projects_select" ON projects FOR SELECT USING (
  deleted_at IS NULL AND (
    owner_id = auth.uid() OR
    id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  )
);
CREATE POLICY "projects_insert" ON projects FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "projects_update" ON projects FOR UPDATE USING (
  owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "projects_delete" ON projects FOR DELETE USING (
  owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- PROJECT MEMBERS
CREATE POLICY "pm_select" ON project_members FOR SELECT USING (
  user_id = auth.uid() OR
  project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
);
CREATE POLICY "pm_manage" ON project_members FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- TASKS
CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (
  deleted_at IS NULL AND (
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (
  assigned_to = auth.uid() OR created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "tasks_delete" ON tasks FOR DELETE USING (
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- TASK COMMENTS
CREATE POLICY "comments_select" ON task_comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON task_comments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "comments_update" ON task_comments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "comments_delete" ON task_comments FOR DELETE USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- NOTIFICATIONS
CREATE POLICY "notif_select" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notif_update" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notif_insert" ON notifications FOR INSERT WITH CHECK (true);

-- ACTIVITY LOGS
CREATE POLICY "activity_select" ON activity_logs FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "activity_insert" ON activity_logs FOR INSERT WITH CHECK (true);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'member'
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated_at  BEFORE UPDATE ON profiles  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects_updated_at  BEFORE UPDATE ON projects  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tasks_updated_at     BEFORE UPDATE ON tasks     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_comments_updated_at  BEFORE UPDATE ON task_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-log task status changes
CREATE OR REPLACE FUNCTION log_task_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO activity_logs (user_id, entity_type, entity_id, action, old_value, new_value)
    VALUES (auth.uid(), 'task', NEW.id, 'status_changed',
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_task_status_log
  AFTER UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION log_task_status_change();

-- ============================================================
-- REALTIME (enable for live updates)
-- ============================================================
-- Run in Supabase Dashboard → Database → Replication:
-- ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
-- ALTER PUBLICATION supabase_realtime ADD TABLE task_comments;

-- ============================================================
-- SEED DATA (optional demo)
-- ============================================================
-- After signing up, make yourself admin:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
