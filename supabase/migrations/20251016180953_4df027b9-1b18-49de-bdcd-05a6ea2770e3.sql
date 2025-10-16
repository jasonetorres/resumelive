-- Add ATS score fields to ratings table
ALTER TABLE ratings
ADD COLUMN IF NOT EXISTS ats_score INTEGER,
ADD COLUMN IF NOT EXISTS ats_formatting_score INTEGER,
ADD COLUMN IF NOT EXISTS ats_skills TEXT[],
ADD COLUMN IF NOT EXISTS ats_keywords TEXT[];

-- Add comment explaining the fields
COMMENT ON COLUMN ratings.ats_score IS 'Overall ATS compatibility score (0-100)';
COMMENT ON COLUMN ratings.ats_formatting_score IS 'Resume formatting score (0-100)';
COMMENT ON COLUMN ratings.ats_skills IS 'Skills extracted from resume';
COMMENT ON COLUMN ratings.ats_keywords IS 'Keywords found in resume';