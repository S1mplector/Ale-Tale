-- Ale Tale Supabase Database Schema
-- Run this in your Supabase SQL Editor to create the tables and policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- JOURNAL ENTRIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Beer details
    beer_name TEXT NOT NULL,
    brewery TEXT,
    style TEXT,
    abv NUMERIC(5,2),
    rating NUMERIC(3,1),
    notes TEXT,
    location TEXT,
    
    -- Dates
    drank_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    synced_at TIMESTAMP WITH TIME ZONE,
    
    -- Image (base64 or URL)
    image_url TEXT,
    
    -- Soft delete
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Indexes
    CONSTRAINT journal_entries_rating_check CHECK (rating >= 0 AND rating <= 5)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON public.journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_updated_at ON public.journal_entries(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_deleted ON public.journal_entries(deleted) WHERE deleted = FALSE;

-- Enable Row Level Security
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for journal_entries
CREATE POLICY "Users can view their own journal entries"
    ON public.journal_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
    ON public.journal_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
    ON public.journal_entries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
    ON public.journal_entries FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- BARS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.bars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Bar details
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    country TEXT,
    rating NUMERIC(3,1),
    notes TEXT,
    
    -- Dates
    visited_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    synced_at TIMESTAMP WITH TIME ZONE,
    
    -- Soft delete
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Constraints
    CONSTRAINT bars_rating_check CHECK (rating >= 0 AND rating <= 5)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bars_user_id ON public.bars(user_id);
CREATE INDEX IF NOT EXISTS idx_bars_created_at ON public.bars(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bars_updated_at ON public.bars(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bars_deleted ON public.bars(deleted) WHERE deleted = FALSE;

-- Enable Row Level Security
ALTER TABLE public.bars ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bars
CREATE POLICY "Users can view their own bars"
    ON public.bars FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bars"
    ON public.bars FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bars"
    ON public.bars FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bars"
    ON public.bars FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for journal_entries
CREATE TRIGGER set_journal_entries_updated_at
    BEFORE UPDATE ON public.journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for bars
CREATE TRIGGER set_bars_updated_at
    BEFORE UPDATE ON public.bars
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- FUNCTIONS FOR BULK OPERATIONS
-- ============================================

-- Function to get entries updated since a timestamp
CREATE OR REPLACE FUNCTION public.get_updated_journal_entries(since TIMESTAMP WITH TIME ZONE)
RETURNS SETOF public.journal_entries AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.journal_entries
    WHERE user_id = auth.uid()
    AND updated_at > since
    ORDER BY updated_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get bars updated since a timestamp
CREATE OR REPLACE FUNCTION public.get_updated_bars(since TIMESTAMP WITH TIME ZONE)
RETURNS SETOF public.bars AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.bars
    WHERE user_id = auth.uid()
    AND updated_at > since
    ORDER BY updated_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SAMPLE DATA (optional - remove in production)
-- ============================================

-- Uncomment to add sample data for testing
-- INSERT INTO public.journal_entries (user_id, beer_name, brewery, style, abv, rating, notes, location, drank_at, created_at, updated_at)
-- VALUES (auth.uid(), 'Sample IPA', 'Sample Brewery', 'IPA', 6.5, 4.5, 'Great hoppy flavor!', 'Sample Pub', NOW(), NOW(), NOW());

-- ============================================
-- GRANTS (if needed for specific roles)
-- ============================================

-- Grant access to authenticated users
GRANT ALL ON public.journal_entries TO authenticated;
GRANT ALL ON public.bars TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_updated_journal_entries TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_updated_bars TO authenticated;
