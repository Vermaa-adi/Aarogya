# HP Government Medical Counselling Platform
## Architecture & Feature Specification

**Date:** 2026-06-03
**Status:** Approved for implementation
**Sprint:** 10-day prototype

---

## 1. Overview

A government-facing telemedicine platform for Himachal Pradesh enabling patients in rural areas
to connect with verified doctors for video consultations. The platform prioritises mobile-first
design, Hindi language support, low-bandwidth resilience, and DPDP Act compliance.

**Primary users:**
- Patients — book and attend consultations, manage health records
- Doctors — manage availability, conduct consultations, write notes/prescriptions
- Admin — verify doctor registrations, monitor platform

**MVP scope (10 days):** Auth flows → Doctor listing & booking → Video consultation link →
Medical records upload → Admin approval flow → Basic ratings

---

## 2. Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Monorepo | Turborepo + Yarn workspaces | Fast builds, shared packages, mirrors cal.diy structure |
| Frontend | Next.js 15 (App Router) | SSR, SEO, Server Actions, route-group-based auth |
| Styling | Tailwind CSS + shadcn/ui | Rapid prototyping, accessible, mobile-first |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions) | All-in-one BaaS, ideal for 10-day sprint |
| Mutations | Next.js Server Actions | Co-located with components, no separate API files |
| i18n | next-intl | Hindi + English with SSR support |
| Video | Daily.co | HIPAA-eligible, simple embed, room creation API |
| Forms | React Hook Form + Zod | Client validation + server-side schema reuse |
| Client state | TanStack Query | Server state + Supabase Realtime sync |
| Hosting | Vercel (frontend) + Supabase (backend) | Free tier sufficient for prototype |

---

## 3. Monorepo Structure

```
hp-medical/
├── apps/
│   └── web/                          # Next.js 15 — the single app
│       ├── src/
│       │   ├── app/                  # App Router pages & layouts
│       │   ├── components/           # Shared React components
│       │   ├── lib/
│       │   │   └── supabase/
│       │   │       ├── client.ts     # createBrowserClient() — Client Components
│       │   │       ├── server.ts     # createServerClient() — Server Components & Actions
│       │   │       └── middleware.ts # createServerClient() — Next.js middleware
│       │   └── middleware.ts         # Route protection + role-based redirects
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── package.json
├── packages/
│   ├── ui/                           # shadcn/ui component wrappers
│   ├── lib/                          # Zod schemas, date utils, encryption helpers
│   └── config/                       # Shared tsconfig, eslint, tailwind base config
├── supabase/                         # Supabase CLI project root
│   ├── migrations/                   # Versioned SQL migration files
│   ├── functions/
│   │   ├── create-video-room/        # Daily.co room on booking confirmation
│   │   ├── send-otp-sms/             # Twilio SMS OTP fallback
│   │   └── verify-doctor/            # Email notification after admin approval
│   ├── seed.sql
│   └── config.toml
├── turbo.json
├── package.json
└── yarn.lock
```

---

## 4. Page Architecture

### 4.1 App Router folder structure

```
src/app/
├── layout.tsx                              # Root layout (fonts, providers)
├── page.tsx                                # / — Landing
├── about/
│   └── page.tsx                            # /about
├── auth/
│   ├── layout.tsx                          # Redirects away if already signed in
│   ├── login/page.tsx                      # /auth/login — Patient login
│   ├── signup/page.tsx                     # /auth/signup — Patient signup
│   ├── doctor/
│   │   ├── login/page.tsx                  # /auth/doctor/login
│   │   └── signup/page.tsx                 # /auth/doctor/signup
│   ├── verify-otp/page.tsx                 # /auth/verify-otp (shared)
│   └── forgot-password/page.tsx            # /auth/forgot-password
├── (patient-area)/
│   ├── layout.tsx                          # Guards: role === PATIENT
│   ├── dashboard/page.tsx                  # /dashboard
│   ├── profile/page.tsx                    # /profile
│   ├── records/page.tsx                    # /records
│   ├── doctors/
│   │   ├── page.tsx                        # /doctors
│   │   └── [id]/
│   │       ├── page.tsx                    # /doctors/[id]
│   │       └── book/page.tsx               # /doctors/[id]/book
│   └── appointments/page.tsx              # /appointments
├── (doctor-area)/
│   ├── layout.tsx                          # Guards: role === DOCTOR
│   └── doctor/
│       ├── dashboard/page.tsx              # /doctor/dashboard
│       ├── profile/page.tsx                # /doctor/profile (edit)
│       ├── requests/page.tsx               # /doctor/requests
│       ├── appointments/[id]/patient/
│       │   └── page.tsx                    # /doctor/appointments/[id]/patient
│       └── verification-pending/page.tsx   # /doctor/verification-pending
├── (admin-area)/
│   ├── layout.tsx                          # Guards: role === ADMIN
│   └── admin/
│       ├── login/page.tsx                  # /admin/login
│       └── approvals/page.tsx             # /admin/approvals
├── unauthorized/page.tsx                   # /unauthorized
└── not-found.tsx                           # 404
```

---

### 4.2 Page Specifications

#### 🏠 Public Pages

---

**`/` — Landing page**

- Hero section: value proposition, two primary CTAs — "Book a Consultation" (`/auth/signup`)
  and "Join as Doctor" (`/auth/doctor/signup`)
- How it works: 3-step visual — Search doctor → Book slot → Video consult
- Feature highlights: rural-accessible, Hindi support, verified doctors, secure records
- Trust signals: HP Government branding, doctor count, disclaimer badge
- Footer: links to About, Terms, Privacy, Emergency (108)
- Disclaimer (sticky or footer): *"This platform is not for medical emergencies. Call 108."*

**`/about` — About & FAQ**

- Brief platform description and HP Government context
- FAQ: privacy, data handling, emergency limitations, doctor verification process
- Disclaimer section with legal language about platform limitations

---

#### 🔐 Auth Pages

---

**`/auth/signup` — Patient signup**

- Fields: Full name, Phone number → OTP verification, Email (optional), Password
- On success: creates `users` row (role=PATIENT) + `patient_profiles` row via DB trigger
- Redirects to `/dashboard`
- Includes consent checkbox linking to Privacy Policy (required for DPDP)

**`/auth/login` — Patient login**

- Two tabs: Phone + OTP (default) | Email + Password
- Phone OTP uses Supabase Auth SMS (Twilio)
- On success: redirects to `/dashboard`
- On role mismatch (e.g., doctor trying patient login): redirects to `/unauthorized`

**`/auth/doctor/signup` — Doctor signup**

- Fields: Full name, Email, Password, Specialisation (multi-select), License number,
  License document (PDF/image, uploaded to `doctor-docs` Supabase Storage bucket)
- Creates `users` (role=DOCTOR) + `doctor_profiles` (is_verified=false) via DB trigger
- Redirects to `/doctor/verification-pending`

**`/auth/doctor/login` — Doctor login**

- Email + Password only (no OTP for doctors)
- If `is_verified=false`: redirects to `/doctor/verification-pending`
- If verified: redirects to `/doctor/dashboard`

**`/auth/verify-otp` — OTP verification (shared component)**

- Receives phone number via URL query param or session cookie
- 6-digit OTP input with 60-second resend timer
- Used by: patient signup, patient login (OTP tab), password reset
- On verify: calls `supabase.auth.verifyOtp()`, then redirects based on context

**`/auth/forgot-password`**

- Email input → Supabase Auth sends magic link / password reset email
- Works for both patients and doctors; role-based redirect after reset

---

#### 🧑‍⚕️ Patient Pages (protected — role: PATIENT)

---

**`/dashboard` — Patient Dashboard**

- Upcoming appointments widget: next 3, with status badge and video link if CONFIRMED
- Quick actions strip: "Find a Doctor" / "Upload Record" / "My Appointments"
- Recent activity: last appointment summary, last record uploaded
- Realtime: subscribes to `appointments` channel filtered by `patient_id=eq.{userId}`
  → status badge updates live without page refresh

**`/profile` — Patient Profile**

- Editable fields: Name, Date of birth, Blood group, Known conditions, Emergency contact
- Avatar upload → Supabase Storage `avatars` bucket
- Server Action: `updatePatientProfile(formData)` — validates with Zod, upserts `patient_profiles`
- `revalidatePath('/profile')` after save

**`/records` — Medical Records**

- Upload form: file picker (PDF/JPEG/PNG, max 10 MB), description, date
- Server Action: `uploadMedicalRecord(formData)`:
  1. Upload file to Supabase Storage `medical-records` bucket
  2. Insert row into `medical_records` with `file_url`
- Records list: cards showing filename, description, date, and a "Download" button
  (generates a 24-hour signed URL via `supabase.storage.from('medical-records').createSignedUrl()`)
- Delete: Server Action `deleteMedicalRecord(id)` — removes from Storage and DB

**`/doctors` — Find Doctors**

- Search: text input (name or specialisation)
- Filters: Speciality (multi-select), Language, Minimum rating (star selector)
- Doctor cards: avatar, name, specialties, rating (avg + count), fee, "Available" indicator
- Data: Server Component fetches `doctor_profiles WHERE is_verified=true` with filters
- Pagination: 12 per page with cursor-based navigation
- No results state with "Clear filters" CTA

**`/doctors/[id]` — Doctor Profile (patient view)**

- Read-only profile: bio, qualifications, languages, fee per session
- Star rating display: average score + total review count + 5 most recent reviews
- Availability preview: displays weekly open slots from `doctor_profiles.availability` jsonb
- CTA button: "Book Appointment" → `/doctors/[id]/book`

**`/doctors/[id]/book` — Book Appointment**

- Calendar/slot picker:
  - Derives available slots from `doctor_profiles.availability` (weekly schedule)
  - Removes slots occupied by existing PENDING or CONFIRMED appointments (queried server-side)
  - Shows next 14 days; past slots and fully-booked days are disabled
- Form: Symptoms / Reason textarea (required, max 500 chars)
- Submit: Server Action `createBooking(doctorId, slotStart, slotEnd, reason)`:
  1. Re-validates slot availability (prevent race condition)
  2. Inserts `appointments(status=PENDING)`
  3. Supabase Realtime broadcasts to doctor channel
- Success: redirect to `/appointments` with success toast "Booking requested — waiting for doctor confirmation"

**`/appointments` — My Appointments**

- Tabs: Upcoming | Past | Cancelled
- Each card: doctor avatar/name, date/time, status badge (colour-coded), video join link (if CONFIRMED)
- Cancel action: Server Action `cancelAppointment(id)`
  — only enabled if `status=PENDING` and `slot_start` is more than 2 hours away
- Rate action: shown on COMPLETED appointments without an existing rating
  — inline rating form: 1–5 star selector + optional review text
  — Server Action `submitRating(appointmentId, score, review)`
- Realtime subscription: live status updates

---

#### 👨‍⚕️ Doctor Pages (protected — role: DOCTOR)

---

**`/doctor/verification-pending`**

- Informational page: "Your profile is under review. You'll receive an email once approved."
- Shows submitted details (name, specialties, license number) read-only
- Accessible to any DOCTOR role regardless of `is_verified` value
- No navigation to other doctor pages (layout renders minimal chrome)

**`/doctor/dashboard` — Doctor Dashboard**

- Stats strip: pending requests count, today's sessions, total unique patients
- Pending requests panel (first 3): patient name, requested slot, inline Accept / Decline buttons
- Today's sessions: list with video join link per confirmed appointment
- Realtime: subscribes to `appointments` channel filtered by `doctor_id=eq.{userId}`

**`/doctor/profile` — Doctor Profile (edit)**

- Sections:
  - Basic info: name, bio, languages (multi-select)
  - Qualifications: degree, institution, experience years
  - Specialties: multi-select pill input
  - Fee: number input (₹ INR)
  - Photo: avatar upload → `avatars` bucket
  - Availability editor: per-day weekly slot builder (add/remove time ranges per day)
    Saved as `doctor_profiles.availability` jsonb:
    `{ "monday": [{"start":"09:00","end":"10:00"}], "tuesday": [...], ... }`
- Server Action: `updateDoctorProfile(formData)` — validates, upserts `doctor_profiles`

**`/doctor/requests` — Appointment Requests**

- Full list of PENDING appointments, sorted by `created_at` ascending
- Each row: patient name, requested slot date/time, symptoms/reason excerpt
- Actions per row:
  - **Accept**: Server Action `acceptAppointment(id)`:
    1. Invokes Edge Function `create-video-room` (creates Daily.co room with TTL = slot_end + 30 min)
    2. Updates `appointments.status = CONFIRMED`, sets `video_url`
    3. Realtime broadcasts to patient channel
  - **Decline**: Server Action `declineAppointment(id, reason)`:
    1. Updates `appointments.status = DECLINED`
    2. Realtime broadcasts to patient channel
- Realtime: new requests appear without page refresh

**`/doctor/appointments/[id]/patient` — Patient View (consult context)**

- Access guard: appointment must be CONFIRMED or COMPLETED, and `doctor_id` must match current user
- Displays:
  - Patient: name, DOB, blood group, known conditions
  - Medical records list: filename, description, download via signed URL
- Consultation notes form:
  - Notes textarea
  - Prescription textarea
  - "Save & Complete" button
- Server Action `saveConsultNotes(appointmentId, notes, prescription)`:
  1. Inserts `consult_notes` row
  2. Updates `appointments.status = COMPLETED`
  3. `revalidatePath('/doctor/dashboard')`

---

#### 🔒 Admin Pages (protected — role: ADMIN)

---

**`/admin/login`**

- Email + Password only (no OTP — admin is an internal user)
- Separate visual treatment from patient/doctor auth (simpler, no branding hero)
- On success: redirects to `/admin/approvals`

**`/admin/approvals` — Doctor Approvals**

- Lists all doctors with `is_verified=false` ordered by signup date (oldest first)
- Each card: name, email, specialties, license number, signup date
- License document: "View Document" opens a 1-hour signed URL in a new tab
- Actions:
  - **Approve**: Server Action `approveDoctor(userId)`:
    1. Sets `doctor_profiles.is_verified = true`
    2. Invokes Edge Function `verify-doctor` (sends approval email with login link)
  - **Reject**: Server Action `rejectDoctor(userId, reason)`:
    1. Optionally hard-deletes or flags the record
    2. Sends rejection email with reason via Edge Function
- Filter toggle: Pending | Approved | Rejected

---

#### 🧩 Shared / Utility Pages

---

**`/unauthorized`**
- Clear message: "You don't have permission to access this page"
- Role-aware navigation: links to the correct dashboard for the user's role
- If not logged in: link to `/auth/login`

**`not-found.tsx` — 404**
- Friendly message with illustration
- Navigation: "Go to Dashboard" (if signed in) or "Go Home" (if not)

---

## 5. Database Schema

### 5.1 Enums and Tables

```sql
-- Enums
CREATE TYPE user_role AS ENUM ('PATIENT', 'DOCTOR', 'ADMIN');
CREATE TYPE appointment_status AS ENUM (
  'PENDING', 'CONFIRMED', 'DECLINED', 'COMPLETED', 'CANCELLED'
);

-- Identity table (mirrors auth.users)
CREATE TABLE users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  phone      TEXT,
  role       user_role NOT NULL DEFAULT 'PATIENT',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Patient profile
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

-- Doctor profile
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

-- Medical records uploaded by patients
CREATE TABLE medical_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  file_url    TEXT NOT NULL,
  file_type   TEXT,       -- 'pdf' | 'image'
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Appointments (core booking entity)
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

-- Consultation notes (written by doctor)
CREATE TABLE consult_notes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  notes          TEXT,
  prescription   TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Patient ratings for completed appointments
CREATE TABLE ratings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id     UUID NOT NULL REFERENCES patient_profiles(id),
  doctor_id      UUID NOT NULL REFERENCES doctor_profiles(id),
  score          INT NOT NULL CHECK (score BETWEEN 1 AND 5),
  review         TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);
```

### 5.2 Indexes

```sql
CREATE INDEX idx_appointments_patient  ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor   ON appointments(doctor_id);
CREATE INDEX idx_appointments_status   ON appointments(status);
CREATE INDEX idx_appointments_slot     ON appointments(slot_start);
CREATE INDEX idx_doctors_verified      ON doctor_profiles(is_verified);
CREATE INDEX idx_records_patient       ON medical_records(patient_id);
```

### 5.3 Auth Trigger (auto-create users row)

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'PATIENT')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 5.4 Rating Recalculation Trigger

```sql
CREATE OR REPLACE FUNCTION recalculate_doctor_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
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
```

### 5.5 Row Level Security (RLS) Policies

```sql
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
```

---

## 6. Supabase Configuration

### 6.1 Auth Settings

| Setting | Value |
|---|---|
| Phone OTP (primary) | Twilio — configure provider in Supabase Auth dashboard |
| Email + password (fallback) | Enabled |
| OTP expiry | 600 seconds (10 min) |
| Session strategy | Cookie-based (`@supabase/ssr`) |
| Role in metadata | Pass `role` in `options.data` on `signUp()` → read by DB trigger |

### 6.2 Storage Buckets

| Bucket | Access | Max size | Allowed types |
|---|---|---|---|
| `medical-records` | Private (signed URLs, 24h expiry) | 10 MB | PDF, JPEG, PNG |
| `doctor-docs` | Private (owner + admin service key) | 5 MB | PDF, JPEG, PNG |
| `avatars` | Public read | 2 MB | JPEG, PNG, WebP |

### 6.3 Realtime Subscriptions

| Channel | Table | Filter | Consumed by |
|---|---|---|---|
| `patient-appointments` | `appointments` | `patient_id=eq.{userId}` | Patient Dashboard, /appointments |
| `doctor-appointments` | `appointments` | `doctor_id=eq.{userId}` | Doctor Dashboard, /doctor/requests |
| `doctor-pending-count` | `appointments` | `doctor_id=eq.{userId} AND status=eq.PENDING` | Doctor Dashboard badge |

### 6.4 Edge Functions

**`create-video-room`**
- Trigger: called by `acceptAppointment` Server Action via `supabase.functions.invoke()`
- Input: `{ appointmentId, slotEnd }`
- Logic:
  1. POST to Daily.co `/v1/rooms` with `exp: slotEnd + 1800` (30-min buffer), `privacy: "private"`
  2. Update `appointments.video_url = room.url`, `appointments.status = 'CONFIRMED'`
- Output: `{ video_url }` returned to Server Action

**`verify-doctor`**
- Trigger: called by `approveDoctor` Server Action
- Input: `{ userId, doctorName, email }`
- Logic: Send approval email with login link via Resend or Supabase email

**`send-otp-sms`** *(fallback only)*
- Used only if Supabase's built-in Twilio integration is not configured
- Input: `{ phone, otp }`
- Logic: Twilio Messages API

---

## 7. Next.js Architecture

### 7.1 Middleware (route protection)

```
Route                          → Required
/dashboard, /profile, /records,
/doctors/*, /appointments      → role = PATIENT (active session)

/doctor/dashboard,
/doctor/profile,
/doctor/requests,
/doctor/appointments/*         → role = DOCTOR AND is_verified = true

/doctor/verification-pending   → role = DOCTOR (any verification state)

/admin/approvals               → role = ADMIN

/auth/*                        → redirect to dashboard if already signed in

All others                     → public (no session required)
```

Middleware reads the Supabase session from cookies, checks `users.role`, and redirects as above.
`is_verified` is checked by reading `doctor_profiles` server-side and is stored in the session
cookie's metadata after login to avoid a DB round-trip on every request.

### 7.2 Server Action pattern

All mutations follow this structure, co-located in an `actions.ts` file next to each page:

```typescript
// src/app/(patient-area)/records/actions.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const uploadSchema = z.object({
  description: z.string().max(200).optional(),
})

export async function uploadMedicalRecord(formData: FormData) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = uploadSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) throw new Error('Invalid input')

  const file = formData.get('file') as File
  const { data: upload } = await supabase.storage
    .from('medical-records')
    .upload(`${user.id}/${Date.now()}-${file.name}`, file)

  await supabase.from('medical_records').insert({
    patient_id: /* get from patient_profiles */,
    file_url: upload!.path,
    file_type: file.type.includes('pdf') ? 'pdf' : 'image',
    description: parsed.data.description,
  })

  revalidatePath('/records')
}
```

### 7.3 Supabase client variants

| File | Purpose | Key function |
|---|---|---|
| `lib/supabase/server.ts` | Server Components, Server Actions, middleware | `createServerClient(cookies())` |
| `lib/supabase/client.ts` | Client Components (Realtime, interactive UI) | `createBrowserClient()` |
| `middleware.ts` | Route protection | `createServerClient(req.cookies)` |

Admin mutations (e.g., `approveDoctor`) use the **service role key** (bypasses RLS) — this key
is only ever used in Server Actions that first verify `role === ADMIN` from the session.

---

## 8. Key User Flows

### 8.1 Patient booking flow

```
1. /doctors → search + filter doctors
2. /doctors/[id] → review profile and availability
3. /doctors/[id]/book → select slot + enter symptoms
4. Server Action createBooking() → INSERT appointments (PENDING)
5. Supabase Realtime → broadcasts to doctor's channel
6. Patient redirected to /appointments with "Awaiting confirmation" toast
```

### 8.2 Doctor accept → video link flow

```
1. Doctor sees new PENDING request (realtime badge update or /doctor/requests)
2. Clicks Accept → Server Action acceptAppointment(id)
3. Server Action invokes Edge Function create-video-room
4. Edge Function → Daily.co API → creates room with TTL
5. Edge Function → UPDATE appointments SET status=CONFIRMED, video_url=<url>
6. Supabase Realtime → broadcasts to patient's channel
7. Both dashboards update live with "Join Video Call" button
```

### 8.3 Post-consultation flow

```
1. Doctor opens /doctor/appointments/[id]/patient during or after session
2. Views patient records (read-only, signed URLs)
3. Writes consultation notes + prescription
4. Server Action saveConsultNotes() → INSERT consult_notes
                                    → UPDATE appointments SET status=COMPLETED
5. DB trigger recalculates doctor_profiles.rating_avg after patient submits rating
6. Patient sees "Rate your consultation" prompt on /appointments
```

### 8.4 Doctor verification flow

```
1. Doctor completes /auth/doctor/signup → is_verified=false
2. Redirected to /doctor/verification-pending
3. Admin logs in at /admin/login → sees doctor in /admin/approvals queue
4. Admin views license doc (signed URL, 1-hour expiry) → clicks Approve
5. Server Action approveDoctor() → UPDATE doctor_profiles SET is_verified=true
                                 → Invoke Edge Function verify-doctor (sends email)
6. Doctor receives email → logs in → is_verified=true → lands on /doctor/dashboard
```

---

## 9. Frontend Design System

| Category | Decision |
|---|---|
| Base framework | Tailwind CSS (mobile-first: `sm:640px`, `md:768px`, `lg:1024px`) |
| Component library | shadcn/ui — Button, Card, Dialog, Form, Input, Select, Tabs, Badge, Calendar, Avatar |
| Min touch target | 44×44px on all interactive elements |
| Min body font size | 16px |
| Heading size | 20–28px |
| Colour contrast | WCAG AA minimum (4.5:1 for normal text) |
| Status badge colours | CONFIRMED=green, PENDING=amber, DECLINED=red, COMPLETED=blue |
| Loading states | Skeleton loaders on all data-fetching Server Components |
| Offline hints | "Slow connection detected" toast + retry button |
| i18n | next-intl with `en.json` and `hi.json` message files |
| Language toggle | Stored in `localStorage`, applied at root layout |
| Emergency banner | Sticky header on all pages: "Not for emergencies — Call 108" |

---

## 10. External Integrations

| Service | Purpose | Integration point | Config |
|---|---|---|---|
| Daily.co | Video consultation rooms | Edge Function `create-video-room` | `DAILY_API_KEY` in Edge Function secrets |
| Twilio | SMS OTP delivery | Supabase Auth → Twilio provider config | Configured in Supabase dashboard |
| Resend (optional) | Transactional email | Edge Functions `verify-doctor` etc. | `RESEND_API_KEY` in secrets |
| Razorpay | Payments | **Not in MVP** — fee is informational only | Plan for Sprint 2 |

**Daily.co embed pattern (for video pages):**

```tsx
// Shared VideoRoom component used in both patient and doctor views
<iframe
  src={appointment.video_url}
  allow="camera; microphone; fullscreen; display-capture"
  className="w-full h-[600px] rounded-lg"
/>
```

---

## 11. 10-Day Prototype Plan

| Days | Focus | Deliverables |
|---|---|---|
| 1–2 | Setup + Auth | Turborepo init, Supabase project, schema migrations, auth pages (patient + doctor signup/login, OTP flow), middleware, DB triggers |
| 3–4 | Patient core | Patient dashboard, profile edit, medical records upload/list, find doctors page |
| 5–6 | Booking flow | Doctor profile page, slot picker, createBooking Server Action, my appointments page, Realtime notifications |
| 7 | Doctor features | Doctor dashboard, appointment requests, accept/decline, Edge Function for video room |
| 8 | Consult + Admin | Patient view page, consultation notes, admin login, doctor approvals |
| 9 | Polish | Ratings flow, Hindi i18n strings, mobile responsiveness pass, loading/error states |
| 10 | Deploy + test | Vercel deploy, Supabase production project, end-to-end test of full booking flow |

**Priority order within MVP:**
1. Auth (both roles) → 2. Doctor listing & profile → 3. Booking flow → 4. Video link →
5. Records upload → 6. Admin approval → 7. Ratings & i18n

---

## 12. Security & Compliance

### DPDP Act (India)

- Supabase project region: `ap-south-1` (Mumbai) for data residency
- Explicit consent checkbox at patient signup (required, links to Privacy Policy)
- Medical records are RLS-protected — accessible only to the patient and doctors
  with an active or completed appointment; admin has no RLS access to patient records
- Signed URLs for all file downloads expire within 24 hours
- Doctor licence docs use 1-hour signed URLs (admin review only)
- Audit trail: `created_at` / `updated_at` timestamps on all sensitive tables

### Application security

- Supabase `anon` key used in browser (subject to RLS); service role key only in Server Actions
  after explicit `role === ADMIN` session check
- No PHI in logs, error messages, or URL params
- Rate limiting on OTP: built into Supabase Auth (configurable in dashboard)
- MFA: available via Supabase TOTP — recommend enabling for Admin accounts
- Input validation: Zod schemas validated both client-side (React Hook Form) and server-side
  (inside every Server Action) — never trust client input alone

### Required disclaimers (UI)

| Location | Text |
|---|---|
| All page footers | "This platform is not for medical emergencies. For emergencies, call 108." |
| Landing page | Prominent disclaimer card above the fold |
| Before first booking | Consent modal: platform limitations + data usage consent |
| Doctor profiles | "Verified by HP Government Health Department" badge |

---

## 13. Scalability & Future-proofing

- **Supabase → self-hosted Postgres:** Migrations are plain SQL; Edge Functions are standard Deno.
  Fully portable to AWS RDS or GCP CloudSQL without application code changes.
- **Separate API service:** If traffic grows, Server Actions can be extracted to a standalone
  Hono/Express service with no frontend changes (Server Actions become `fetch` calls).
- **Mobile app:** React Native (Expo) can use the same Supabase JS SDK with zero backend changes.
- **AI features:** Post-consultation summary or symptom triage can be added as a new Edge Function
  calling OpenAI API — no changes to existing routes or schema.
- **Payments:** Razorpay integration requires one new Server Action (`createOrder`) and one new
  Edge Function (webhook handler). The `appointments` table has room for a `payment_status` column.
- **Doctor availability:** The `jsonb` weekly schedule is MVP. Migrating to a dedicated
  `availability_slots` table is a single migration + one changed query — no page rewrites needed.

---

## 14. Open Questions (resolve before Day 1)

| # | Question | Default if not resolved |
|---|---|---|
| 1 | Supabase region? | `ap-south-1` (Mumbai) for DPDP compliance |
| 2 | Daily.co plan? Free tier = 10k participant-minutes/month | Start on free; upgrade before public launch |
| 3 | SMS provider: Supabase built-in Twilio or separate Twilio account? | Supabase built-in (configure in dashboard) |
| 4 | Doctor availability: recurring weekly slots or per-date calendar for MVP? | Weekly recurring (jsonb) — simpler to build in 10 days |
| 5 | Video embed: full Daily.co iframe in-app or share link only? | Share link for prototype; iframe embed in v2 |
| 6 | Admin: single hardcoded admin user or multi-admin with invite? | Single admin, role set manually in Supabase dashboard |
| 7 | Password reset email sender: Supabase default domain or custom domain? | Supabase default for prototype |
| 8 | Doctor rejection: soft-delete (flag rejected) or hard-delete? | Soft-delete with `verification_status` enum |

---

*Spec complete. Next step: run `/write-plan` to generate the day-by-day implementation plan.*
