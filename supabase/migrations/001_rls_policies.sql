-- RLS Policies for ReceiptBrain
-- Run these in your Supabase SQL editor after creating the tables.

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Receipt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScanLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SyncLog" ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON "User" FOR SELECT
  USING (auth.uid() = id);

-- Users can only read their own receipts
CREATE POLICY "Users can view own receipts"
  ON "Receipt" FOR SELECT
  USING (auth.uid()::text = "userId");

-- Users can insert their own receipts
CREATE POLICY "Users can insert own receipts"
  ON "Receipt" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

-- Users can update their own receipts
CREATE POLICY "Users can update own receipts"
  ON "Receipt" FOR UPDATE
  USING (auth.uid()::text = "userId");

-- Users can delete their own receipts
CREATE POLICY "Users can delete own receipts"
  ON "Receipt" FOR DELETE
  USING (auth.uid()::text = "userId");

-- ScanLog policies (users can view their own scan logs)
CREATE POLICY "Users can view own scan logs"
  ON "ScanLog" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own scan logs"
  ON "ScanLog" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

-- SyncLog policies
CREATE POLICY "Users can view own sync logs"
  ON "SyncLog" FOR SELECT
  USING (auth.uid()::text = "userId");
