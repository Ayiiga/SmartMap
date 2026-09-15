-- Add mathematics to learning_level enum and extend gamification tracking (backward compatible)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'mathematics'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'learning_level')
  ) THEN
    ALTER TYPE learning_level ADD VALUE 'mathematics';
  END IF;
END $$;

ALTER TABLE gamification
  ADD COLUMN IF NOT EXISTS completed_lessons text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS daily_quest_progress jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS completed_quests text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS unlocked_worlds text[] DEFAULT ARRAY['alphabet-island']::text[],
  ADD COLUMN IF NOT EXISTS strengths text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS weaknesses text[] DEFAULT '{}';

COMMENT ON COLUMN gamification.completed_lessons IS 'Curriculum lesson IDs completed by learner';
COMMENT ON COLUMN gamification.daily_quest_progress IS 'Daily quest progress map keyed by quest id';
