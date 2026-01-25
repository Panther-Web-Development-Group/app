-- Update navigation_items constraint to allow href to be null for parent items
-- This allows parent items (items with children) to have null href

-- Drop the existing constraint
ALTER TABLE public.navigation_items 
DROP CONSTRAINT IF EXISTS valid_href;

-- Add new constraint that allows href to be null for parent items
-- Logic: 
-- - If an item is a child (has parent_id), it must have an href (children are leaf nodes)
-- - If an item is top-level (no parent_id), href can be null (allowing parent items with children)
-- Note: We can't check "has children" in a CHECK constraint, so we allow null href for all top-level items
ALTER TABLE public.navigation_items
ADD CONSTRAINT valid_href CHECK (
    -- If it's a child (has parent_id), it must have an href
    (parent_id IS NOT NULL AND href IS NOT NULL) OR
    -- If it's top-level (no parent_id), href can be null (allowing parent items)
    (parent_id IS NULL)
);

COMMENT ON CONSTRAINT valid_href ON public.navigation_items IS 
'Allows href to be null for top-level items (which can be parents), but requires href for child items';
