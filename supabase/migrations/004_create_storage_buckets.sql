-- ============================================================================
-- Create Storage Buckets for Aarogya
-- ============================================================================

-- 1. Create medical-records bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-records', 'medical-records', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Create doctor-docs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('doctor-docs', 'doctor-docs', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Storage Policies for medical-records
-- ============================================================================

-- Patients can upload their own records
CREATE POLICY "Patients can upload records"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-records' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Patients can view their own records
CREATE POLICY "Patients can view own records"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-records' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Patients can delete their own records
CREATE POLICY "Patients can delete own records"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'medical-records' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Verified doctors can view all medical records
CREATE POLICY "Verified doctors can view records"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-records' AND
  EXISTS (
    SELECT 1 FROM doctor_profiles
    WHERE user_id = auth.uid()
      AND is_verified = true
  )
);

-- ============================================================================
-- Storage Policies for doctor-docs
-- ============================================================================

-- Doctors can upload their own documents
CREATE POLICY "Doctors can upload docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'doctor-docs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Doctors can view their own documents
CREATE POLICY "Doctors can view own docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'doctor-docs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can view doctor documents
CREATE POLICY "Admins can view doctor docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'doctor-docs' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);
