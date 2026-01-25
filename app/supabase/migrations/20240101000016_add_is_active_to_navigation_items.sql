-- Add is_active column to navigation_items table if it doesn't exist
-- This migration ensures the is_active column exists for filtering active navigation items

-- Check if column exists and add it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'navigation_items' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.navigation_items
    ADD COLUMN is_active BOOLEAN DEFAULT true;
    
    -- Add comment
    COMMENT ON COLUMN public.navigation_items.is_active IS 'Whether the navigation item is active and should be displayed';
    
    -- Create index for active items
    CREATE INDEX IF NOT EXISTS idx_navigation_items_active 
    ON public.navigation_items(is_active) 
    WHERE is_active = true;
    
    -- Update existing rows to be active by default
    UPDATE public.navigation_items
    SET is_active = true
    WHERE is_active IS NULL;
  END IF;
END $$;
