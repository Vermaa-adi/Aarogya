-- Update handle_new_user function to extract email/phone from raw_user_meta_data if not directly present
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_role user_role;
  v_name text;
  v_email text;
  v_phone text;
BEGIN
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'PATIENT');
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    'User'
  );
  v_email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email');
  v_phone := COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone');

  -- Insert into public identity table
  INSERT INTO public.users (id, email, phone, role)
  VALUES (
    NEW.id,
    v_email,
    v_phone,
    v_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role;

  -- Auto-create profile based on user role
  IF v_role = 'PATIENT' THEN
    INSERT INTO public.patient_profiles (user_id, name)
    VALUES (NEW.id, v_name)
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF v_role = 'DOCTOR' THEN
    INSERT INTO public.doctor_profiles (user_id, name, specialties, license_no, license_doc_url)
    VALUES (
      NEW.id,
      v_name,
      CASE 
        WHEN jsonb_typeof(NEW.raw_user_meta_data->'specialties') = 'array' THEN
          ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'specialties'))
        ELSE
          '{}'::TEXT[]
      END,
      NEW.raw_user_meta_data->>'license_no',
      NEW.raw_user_meta_data->>'license_doc_url'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
