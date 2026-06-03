-- ============================================================================
-- Aarogya HP Medical Platform — Initial Schema
-- Source: 2026-06-03-hp-medical-architecture.md §5
-- ============================================================================

-- ── Enums ──────────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('PATIENT', 'DOCTOR', 'ADMIN');
CREATE TYPE appointment_status AS ENUM (
  'PENDING', 'CONFIRMED', 'DECLINED', 'COMPLETED', 'CANCELLED'
);

-- ── Identity table (mirrors auth.users) ───────────────────────────────────

CREATE TABLE users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  phone      TEXT,
  role       user_role NOT NULL DEFAULT 'PATIENT',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Patient profile ───────────────────────────────────────────────────────

CREATE TABLE patient_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  dob               DATE,
  blood_group       TEXT,
  known_conditions  TEXT,
  emergency_contact TEXT,
  avatar_url        TEXT,
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ── Doctor profile ────────────────────────────────────────────────────────

CREATE TABLE doctor_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  specialties      TEXT[]   NOT NULL DEFAULT '{}',
  languages        TEXT[]   NOT NULL DEFAULT '{"Hindi","English"}',
  qualification    TEXT,
  experience_years INT,
  license_no       TEXT,
  license_doc_url  TEXT,
  bio              TEXT,
  fee_inr          INT,
  availability     JSONB    DEFAULT '{}',
  rating_avg       FLOAT    DEFAULT 0,
  rating_count     INT      DEFAULT 0,
  is_verified      BOOLEAN  DEFAULT false,
  avatar_url       TEXT,
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ── Medical records uploaded by patients ──────────────────────────────────

CREATE TABLE medical_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  file_url    TEXT NOT NULL,
  file_type   TEXT,       -- 'pdf' | 'image'
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Appointments (core booking entity) ────────────────────────────────────

CREATE TABLE appointments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID NOT NULL REFERENCES patient_profiles(id),
  doctor_id   UUID NOT NULL REFERENCES doctor_profiles(id),
  slot_start  TIMESTAMPTZ NOT NULL,
  slot_end    TIMESTAMPTZ NOT NULL,
  reason      TEXT,
  status      appointment_status NOT NULL DEFAULT 'PENDING',
  video_url   TEXT,       -- populated by Edge Function on CONFIRMED
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Consultation notes (written by doctor) ────────────────────────────────

CREATE TABLE consult_notes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  notes          TEXT,
  prescription   TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ── Patient ratings for completed appointments ────────────────────────────

CREATE TABLE ratings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id     UUID NOT NULL REFERENCES patient_profiles(id),
  doctor_id      UUID NOT NULL REFERENCES doctor_profiles(id),
  score          INT NOT NULL CHECK (score BETWEEN 1 AND 5),
  review         TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────

CREATE INDEX idx_appointments_patient  ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor   ON appointments(doctor_id);
CREATE INDEX idx_appointments_status   ON appointments(status);
CREATE INDEX idx_appointments_slot     ON appointments(slot_start);
CREATE INDEX idx_doctors_verified      ON doctor_profiles(is_verified);
CREATE INDEX idx_records_patient       ON medical_records(patient_id);

-- ── Auth Trigger (auto-create users row and profiles on signup) ───────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_role user_role;
  v_name text;
BEGIN
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'PATIENT');
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    'User'
  );

  -- Insert into public identity table
  INSERT INTO public.users (id, email, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    v_role
  );

  -- Auto-create profile based on user role
  IF v_role = 'PATIENT' THEN
    INSERT INTO public.patient_profiles (user_id, name)
    VALUES (NEW.id, v_name);
  ELSIF v_role = 'DOCTOR' THEN
    INSERT INTO public.doctor_profiles (user_id, name)
    VALUES (NEW.id, v_name);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Rating Recalculation Trigger ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION recalculate_doctor_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE doctor_profiles
  SET
    rating_avg   = (SELECT AVG(score) FROM ratings WHERE doctor_id = NEW.doctor_id),
    rating_count = (SELECT COUNT(*)   FROM ratings WHERE doctor_id = NEW.doctor_id),
    updated_at   = now()
  WHERE id = NEW.doctor_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_rating_insert
  AFTER INSERT ON ratings
  FOR EACH ROW EXECUTE FUNCTION recalculate_doctor_rating();

-- ── Row Level Security (RLS) Policies ─────────────────────────────────────

-- Enable RLS
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE consult_notes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings           ENABLE ROW LEVEL SECURITY;

-- users: each user sees and edits only their own row
CREATE POLICY "users_self" ON users FOR ALL
  USING (auth.uid() = id);

-- patient_profiles: owner full access; verified doctor read for active appointments
CREATE POLICY "patient_profile_owner" ON patient_profiles FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "patient_profile_doctor_read" ON patient_profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM appointments a
    JOIN doctor_profiles d ON d.id = a.doctor_id
    WHERE a.patient_id = patient_profiles.id
      AND d.user_id = auth.uid()
      AND a.status IN ('CONFIRMED', 'COMPLETED')
  ));

-- doctor_profiles: owner full access; public read for verified doctors only
CREATE POLICY "doctor_profile_owner" ON doctor_profiles FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "doctor_profile_public_read" ON doctor_profiles FOR SELECT
  USING (is_verified = true);

-- medical_records: patient owner only; doctor reads if active appointment exists
CREATE POLICY "records_owner" ON medical_records FOR ALL
  USING (patient_id IN (
    SELECT id FROM patient_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "records_doctor_read" ON medical_records FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM appointments a
    JOIN doctor_profiles d ON d.id = a.doctor_id
    WHERE a.patient_id = medical_records.patient_id
      AND d.user_id = auth.uid()
      AND a.status IN ('CONFIRMED', 'COMPLETED')
  ));

-- appointments: patient sees own; doctor sees own
CREATE POLICY "appointments_patient" ON appointments FOR ALL
  USING (patient_id IN (
    SELECT id FROM patient_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "appointments_doctor" ON appointments FOR ALL
  USING (doctor_id IN (
    SELECT id FROM doctor_profiles WHERE user_id = auth.uid()
  ));

-- consult_notes: doctor writes; patient reads
CREATE POLICY "notes_doctor" ON consult_notes FOR ALL
  USING (appointment_id IN (
    SELECT a.id FROM appointments a
    JOIN doctor_profiles d ON d.id = a.doctor_id
    WHERE d.user_id = auth.uid()
  ));

CREATE POLICY "notes_patient_read" ON consult_notes FOR SELECT
  USING (appointment_id IN (
    SELECT a.id FROM appointments a
    JOIN patient_profiles p ON p.id = a.patient_id
    WHERE p.user_id = auth.uid()
  ));

-- ratings: patient inserts; public reads (shown on doctor profile)
CREATE POLICY "ratings_patient_insert" ON ratings FOR INSERT
  WITH CHECK (patient_id IN (
    SELECT id FROM patient_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "ratings_public_read" ON ratings FOR SELECT
  USING (true);

-- ============================================================================
-- End of initial schema
-- ============================================================================
