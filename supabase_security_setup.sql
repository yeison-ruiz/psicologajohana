-- PSICOCONNECT PRODUCTION SECURITY: ROW LEVEL SECURITY (RLS)
-- Copy and paste this into your Supabase SQL Editor to secure your production database.

--------------------------------------------------------------------------------
-- 1. ENABLE RLS ON ALL TABLES
--------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_consultation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE psicologa_settings ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- 2. CREATE FUNCTION TO CHECK IF USER IS ADMIN
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'email' = 'carolinavillabon01@gmail.com' OR 
    auth.jwt() ->> 'email' = 'ingyeisonruiz26@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--------------------------------------------------------------------------------
-- 3. PROFILES POLICIES
--------------------------------------------------------------------------------
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
FOR ALL USING (is_admin());

--------------------------------------------------------------------------------
-- 4. APPOINTMENTS POLICIES
--------------------------------------------------------------------------------
-- Patients can view their own appointments
CREATE POLICY "Patients view own appointments" ON appointments
FOR SELECT USING (auth.uid() = patient_id);

-- Patients can create their own appointments
CREATE POLICY "Patients create own appointments" ON appointments
FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Admins can do everything
CREATE POLICY "Admins full access to appointments" ON appointments
FOR ALL USING (is_admin());

--------------------------------------------------------------------------------
-- 5. PAYMENTS POLICIES
--------------------------------------------------------------------------------
-- Patients can view their own payments
CREATE POLICY "Patients view own payments" ON payments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM appointments 
    WHERE appointments.id = payments.appointment_id 
    AND appointments.patient_id = auth.uid()
  )
);

-- Patients can insert payments for their own appointments
CREATE POLICY "Patients insert own payments" ON payments
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM appointments 
    WHERE appointments.id = payments.appointment_id 
    AND appointments.patient_id = auth.uid()
  )
);

-- Admins full access
CREATE POLICY "Admins full access to payments" ON payments
FOR ALL USING (is_admin());

--------------------------------------------------------------------------------
-- 6. PRE-CONSULTATION REPORTS POLICIES (Highly Sensitive)
--------------------------------------------------------------------------------
-- Only Admins can view reports
CREATE POLICY "Admins view pre-consult reports" ON pre_consultation_reports
FOR SELECT USING (is_admin());

-- Patients can INSERT reports (AI creates them on their behalf)
CREATE POLICY "Patients insert pre-consult reports" ON pre_consultation_reports
FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Patients can UPDATE their own chat history (or AI through their session)
CREATE POLICY "Patients update own pre-consult reports" ON pre_consultation_reports
FOR UPDATE USING (auth.uid() = patient_id);

--------------------------------------------------------------------------------
-- 7. SLOTS POLICIES (Public to view)
--------------------------------------------------------------------------------
CREATE POLICY "Anyone can view available slots" ON availability_slots
FOR SELECT USING (true);

CREATE POLICY "Admins full access to slots" ON availability_slots
FOR ALL USING (is_admin());

--------------------------------------------------------------------------------
-- 8. CLINICAL NOTES (Admin Only)
--------------------------------------------------------------------------------
CREATE POLICY "Admins only access clinical notes" ON clinical_notes
FOR ALL USING (is_admin());
