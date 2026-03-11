const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Actually we need service_role for bypassing RLS, but for anon key we can only insert if RLS allows it. Wait, RLS on profiles might forbid arbitrary inserts.
);
