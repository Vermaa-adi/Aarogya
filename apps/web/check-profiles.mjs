import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/adityaverma/Desktop/Aarogya/apps/web/.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: users } = await supabase.from('users').select('*');
  console.log("=== PUBLIC USERS ===");
  users.forEach(u => console.log(`  ${u.id} | ${u.email} | role=${u.role}`));
  
  const { data: patients } = await supabase.from('patient_profiles').select('*');
  console.log("\n=== PATIENT PROFILES ===");
  patients.forEach(p => console.log(`  id=${p.id} | user_id=${p.user_id} | name=${p.name}`));

  const { data: doctors } = await supabase.from('doctor_profiles').select('id, user_id, name, is_verified');
  console.log("\n=== DOCTOR PROFILES ===");
  doctors.forEach(d => console.log(`  id=${d.id} | user_id=${d.user_id} | name=${d.name} | verified=${d.is_verified}`));
  
  // Check auth users
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  console.log("\n=== AUTH USERS ===");
  authUsers.users.forEach(u => console.log(`  ${u.id} | ${u.email} | meta.role=${u.user_metadata?.role}`));
}
run();
