-- ============================================================================
-- Fix infinite recursion in RLS policies
-- ============================================================================
-- The problem: appointments policies reference patient_profiles,
-- and patient_profiles has a policy that references appointments → infinite loop.
--
-- Solution: Use SECURITY DEFINER helper functions that bypass RLS for the
-- inner lookups, breaking the circular dependency.
-- ============================================================================

-- 1. Create helper functions (SECURITY DEFINER = bypasses RLS on inner queries)

CREATE OR REPLACE FUNCTION get_patient_profile_id_for_user(uid uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.patient_profiles WHERE user_id = uid LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_doctor_profile_id_for_user(uid uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.doctor_profiles WHERE user_id = uid LIMIT 1;
$$;

-- Helper: check if a doctor (by auth uid) has an active appointment with a patient
CREATE OR REPLACE FUNCTION doctor_has_appointment_with_patient(doctor_uid uuid, p_patient_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.doctor_profiles d ON d.id = a.doctor_id
    WHERE a.patient_id = p_patient_id
      AND d.user_id = doctor_uid
      AND a.status IN ('CONFIRMED', 'COMPLETED')
  );
$$;

-- 2. Drop the old recursive policies

DROP POLICY IF EXISTS "appointments_patient" ON appointments;
DROP POLICY IF EXISTS "appointments_doctor" ON appointments;
DROP POLICY IF EXISTS "patient_profile_doctor_read" ON patient_profiles;
DROP POLICY IF EXISTS "records_owner" ON medical_records;
DROP POLICY IF EXISTS "records_doctor_read" ON medical_records;
DROP POLICY IF EXISTS "notes_doctor" ON consult_notes;
DROP POLICY IF EXISTS "notes_patient_read" ON consult_notes;
DROP POLICY IF EXISTS "ratings_patient_insert" ON ratings;

-- 3. Recreate policies using the helper functions (no more recursion)

-- appointments: patient sees own
CREATE POLICY "appointments_patient" ON appointments FOR ALL
  USING (patient_id = get_patient_profile_id_for_user(auth.uid()));

-- appointments: doctor sees own
CREATE POLICY "appointments_doctor" ON appointments FOR ALL
  USING (doctor_id = get_doctor_profile_id_for_user(auth.uid()));

-- patient_profiles: verified doctor can read if they have an active appointment
CREATE POLICY "patient_profile_doctor_read" ON patient_profiles FOR SELECT
  USING (doctor_has_appointment_with_patient(auth.uid(), id));

-- medical_records: patient owner
CREATE POLICY "records_owner" ON medical_records FOR ALL
  USING (patient_id = get_patient_profile_id_for_user(auth.uid()));

-- medical_records: doctor reads if active appointment
CREATE POLICY "records_doctor_read" ON medical_records FOR SELECT
  USING (doctor_has_appointment_with_patient(auth.uid(), patient_id));

-- consult_notes: doctor writes
CREATE POLICY "notes_doctor" ON consult_notes FOR ALL
  USING (appointment_id IN (
    SELECT a.id FROM appointments a
    WHERE a.doctor_id = get_doctor_profile_id_for_user(auth.uid())
  ));

-- consult_notes: patient reads
CREATE POLICY "notes_patient_read" ON consult_notes FOR SELECT
  USING (appointment_id IN (
    SELECT a.id FROM appointments a
    WHERE a.patient_id = get_patient_profile_id_for_user(auth.uid())
  ));

-- ratings: patient inserts
CREATE POLICY "ratings_patient_insert" ON ratings FOR INSERT
  WITH CHECK (patient_id = get_patient_profile_id_for_user(auth.uid()));
