const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase env variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupTestUserAndSlots() {
  const email = 'test-paciente@example.com';
  const password = 'TestPassword123!';
  const fullName = 'Test Paciente Playwright';

  console.log(`Setting up test user: ${email}`);

  // 1. Delete user if exists (to start fresh)
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const existingUser = users.users.find(u => u.email === email);
  if (existingUser) {
    console.log('Deleting existing test user...');
    await supabase.auth.admin.deleteUser(existingUser.id);
  }

  // 2. Create user
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'paciente'
    }
  });

  if (createError) {
    console.error('Error creating user:', createError);
    return;
  }

  console.log('Test user created successfully:', newUser.user.id);
  
  // 3. Ensure profile exists
  await supabase
    .from('profiles')
    .upsert({
      id: newUser.user.id,
      full_name: fullName,
      role: 'paciente',
      email: email
    });

  // 4. Create a test slot for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  
  const end = new Date(tomorrow);
  end.setHours(11, 0, 0, 0);

  console.log('Creating test slot for tomorrow...');
  const { data: slot, error: slotError } = await supabase
    .from('availability_slots')
    .insert({
      psicologa_id: 'fc622c19-5fb4-40e7-914f-bd81681a5d73', // Johana's ID from earlier SQL
      start_at: tomorrow.toISOString(),
      end_at: end.toISOString(),
      duration_minutes: 60,
      price: 120000,
      session_type: 'Terapia Individual',
      is_available: true
    })
    .select();

  if (slotError) {
    console.error('Error creating slot:', slotError);
  } else {
    console.log('Test slot created:', slot[0].id);
  }
}

setupTestUserAndSlots();
