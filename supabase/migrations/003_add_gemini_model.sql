-- ============================================
-- Add Gemini 2.0 Flash to model constraints
-- ============================================

-- Drop and recreate model CHECK constraints on comparisons table
ALTER TABLE comparisons DROP CONSTRAINT IF EXISTS comparisons_model_a_check;
ALTER TABLE comparisons DROP CONSTRAINT IF EXISTS comparisons_model_b_check;

ALTER TABLE comparisons ADD CONSTRAINT comparisons_model_a_check
  CHECK (model_a IN ('gpt-4o-mini', 'claude-3-5-haiku', 'gemini-2.0-flash'));
ALTER TABLE comparisons ADD CONSTRAINT comparisons_model_b_check
  CHECK (model_b IN ('gpt-4o-mini', 'claude-3-5-haiku', 'gemini-2.0-flash'));

-- Update user_preferences constraints too
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_default_model_a_check;
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_default_model_b_check;

ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_default_model_a_check
  CHECK (default_model_a IN ('gpt-4o-mini', 'claude-3-5-haiku', 'gemini-2.0-flash'));
ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_default_model_b_check
  CHECK (default_model_b IN ('gpt-4o-mini', 'claude-3-5-haiku', 'gemini-2.0-flash'));
