CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open', -- 'open', 'in_review', 'resolved', 'refunded'
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own disputes" ON disputes
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Businesses can read disputes directed at them" ON disputes
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid() OR id IN (
        SELECT business_id FROM staff_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert own disputes" ON disputes
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins have full access to disputes" ON disputes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
