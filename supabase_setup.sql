
-- Create schema
CREATE SCHEMA IF NOT EXISTS focus_theme;

-- Create themes table
CREATE TABLE IF NOT EXISTS focus_theme.themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    goal TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_duration INTEGER DEFAULT 0,
    notes TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create resources table
CREATE TABLE IF NOT EXISTS focus_theme.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID NOT NULL REFERENCES focus_theme.themes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT,
    type TEXT CHECK (type IN ('web', 'book', 'video', 'article', 'podcast', 'other')),
    completed BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create learning_logs table
CREATE TABLE IF NOT EXISTS focus_theme.learning_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID NOT NULL REFERENCES focus_theme.themes(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE focus_theme.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_theme.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_theme.learning_logs ENABLE ROW LEVEL SECURITY;

-- Policies for focus_theme.themes
DROP POLICY IF EXISTS "Users can view their own themes" ON focus_theme.themes;
CREATE POLICY "Users can view their own themes" ON focus_theme.themes
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own themes" ON focus_theme.themes;
CREATE POLICY "Users can insert their own themes" ON focus_theme.themes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own themes" ON focus_theme.themes;
CREATE POLICY "Users can update their own themes" ON focus_theme.themes
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own themes" ON focus_theme.themes;
CREATE POLICY "Users can delete their own themes" ON focus_theme.themes
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for focus_theme.resources
DROP POLICY IF EXISTS "Users can view their own resources" ON focus_theme.resources;
CREATE POLICY "Users can view their own resources" ON focus_theme.resources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM focus_theme.themes
            WHERE themes.id = resources.theme_id AND themes.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own resources" ON focus_theme.resources;
CREATE POLICY "Users can insert their own resources" ON focus_theme.resources
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM focus_theme.themes
            WHERE themes.id = theme_id AND themes.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own resources" ON focus_theme.resources;
CREATE POLICY "Users can update their own resources" ON focus_theme.resources
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM focus_theme.themes
            WHERE themes.id = resources.theme_id AND themes.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own resources" ON focus_theme.resources;
CREATE POLICY "Users can delete their own resources" ON focus_theme.resources
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM focus_theme.themes
            WHERE themes.id = resources.theme_id AND themes.user_id = auth.uid()
        )
    );

-- Policies for focus_theme.learning_logs
DROP POLICY IF EXISTS "Users can view their own logs" ON focus_theme.learning_logs;
CREATE POLICY "Users can view their own logs" ON focus_theme.learning_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM focus_theme.themes
            WHERE themes.id = learning_logs.theme_id AND themes.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own logs" ON focus_theme.learning_logs;
CREATE POLICY "Users can insert their own logs" ON focus_theme.learning_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM focus_theme.themes
            WHERE themes.id = theme_id AND themes.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own logs" ON focus_theme.learning_logs;
CREATE POLICY "Users can update their own logs" ON focus_theme.learning_logs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM focus_theme.themes
            WHERE themes.id = learning_logs.theme_id AND themes.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own logs" ON focus_theme.learning_logs;
CREATE POLICY "Users can delete their own logs" ON focus_theme.learning_logs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM focus_theme.themes
            WHERE themes.id = learning_logs.theme_id AND themes.user_id = auth.uid()
        )
    );

-- Grant permissions to authenticated users
GRANT ALL ON TABLE focus_theme.themes TO authenticated;
GRANT ALL ON TABLE focus_theme.resources TO authenticated;
GRANT ALL ON TABLE focus_theme.learning_logs TO authenticated;
GRANT USAGE ON SCHEMA focus_theme TO authenticated;
GRANT USAGE ON SCHEMA focus_theme TO anon;
