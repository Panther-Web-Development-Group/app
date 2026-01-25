-- Create navigation_items table with support for submenus
CREATE TABLE IF NOT EXISTS navigation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES navigation_items(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    href TEXT,
    icon TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_external BOOLEAN DEFAULT false,
    target TEXT DEFAULT '_self',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure href is provided for non-parent items or parent items can have null href
    CONSTRAINT valid_href CHECK (
        (parent_id IS NULL AND href IS NOT NULL) OR 
        (parent_id IS NOT NULL) OR
        (href IS NOT NULL)
    ),
    
    -- Prevent circular references (a parent cannot be its own descendant)
    CONSTRAINT no_self_reference CHECK (id != parent_id)
);

-- Create index for parent_id for efficient submenu queries
CREATE INDEX IF NOT EXISTS idx_navigation_items_parent_id ON navigation_items(parent_id);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_navigation_items_order ON navigation_items(order_index);

-- Create index for active items
CREATE INDEX IF NOT EXISTS idx_navigation_items_active ON navigation_items(is_active) WHERE is_active = true;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_navigation_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_navigation_items_updated_at
    BEFORE UPDATE ON navigation_items
    FOR EACH ROW
    EXECUTE FUNCTION update_navigation_items_updated_at();

-- Create function to prevent circular references in hierarchy
CREATE OR REPLACE FUNCTION check_navigation_items_circular_reference()
RETURNS TRIGGER AS $$
DECLARE
    current_parent_id UUID;
BEGIN
    -- If parent_id is NULL, no circular reference possible
    IF NEW.parent_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Check if the new parent_id would create a circular reference
    current_parent_id := NEW.parent_id;
    
    -- Traverse up the hierarchy to check for circular reference
    WHILE current_parent_id IS NOT NULL LOOP
        IF current_parent_id = NEW.id THEN
            RAISE EXCEPTION 'Circular reference detected: item cannot be its own ancestor';
        END IF;
        
        SELECT parent_id INTO current_parent_id
        FROM navigation_items
        WHERE id = current_parent_id;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent circular references
CREATE TRIGGER trigger_check_navigation_items_circular_reference
    BEFORE INSERT OR UPDATE ON navigation_items
    FOR EACH ROW
    EXECUTE FUNCTION check_navigation_items_circular_reference();

-- Create function to get navigation tree (useful for queries)
CREATE OR REPLACE FUNCTION get_navigation_tree(root_parent_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    parent_id UUID,
    label TEXT,
    href TEXT,
    icon TEXT,
    image TEXT,
    order_index INTEGER,
    is_active BOOLEAN,
    is_external BOOLEAN,
    target TEXT,
    metadata JSONB,
    level INTEGER,
    path TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE nav_tree AS (
        -- Base case: root level items
        SELECT 
            ni.id,
            ni.parent_id,
            ni.label,
            ni.href,
            ni.icon,
            ni.order_index,
            ni.is_active,
            ni.is_external,
            ni.target,
            ni.metadata,
            0 as level,
            ARRAY[ni.id::TEXT] as path
        FROM navigation_items ni
        WHERE (root_parent_id IS NULL AND ni.parent_id IS NULL)
           OR (root_parent_id IS NOT NULL AND ni.parent_id = root_parent_id)
        
        UNION ALL
        
        -- Recursive case: child items
        SELECT 
            ni.id,
            ni.parent_id,
            ni.label,
            ni.href,
            ni.icon,
            ni.image,
            ni.order_index,
            ni.is_active,
            ni.is_external,
            ni.target,
            ni.metadata,
            nt.level + 1,
            nt.path || ni.id::TEXT
        FROM navigation_items ni
        INNER JOIN nav_tree nt ON ni.parent_id = nt.id
        WHERE NOT (ni.id::TEXT = ANY(nt.path)) -- Prevent cycles
    )
    SELECT * FROM nav_tree
    ORDER BY level, order_index, label;
END;
$$ LANGUAGE plpgsql;

-- Create view for active navigation items with hierarchy
CREATE OR REPLACE VIEW active_navigation_items AS
SELECT 
    ni.id,
    ni.parent_id,
    ni.label,
    ni.href,
    ni.icon,
    ni.order_index,
    ni.is_external,
    ni.target,
    ni.metadata,
    CASE 
        WHEN ni.parent_id IS NULL THEN 0
        ELSE 1
    END as level
FROM navigation_items ni
WHERE ni.is_active = true
ORDER BY ni.order_index, ni.label;

-- Add comment to table
COMMENT ON TABLE navigation_items IS 'Stores navigation menu items with support for hierarchical submenus';
COMMENT ON COLUMN navigation_items.parent_id IS 'Reference to parent navigation item. NULL for top-level items.';
COMMENT ON COLUMN navigation_items.label IS 'Display text for the navigation item';
COMMENT ON COLUMN navigation_items.href IS 'URL or route path for the navigation item';
COMMENT ON COLUMN navigation_items.icon IS 'Icon identifier or class name for the navigation item';
COMMENT ON COLUMN navigation_items.image IS 'Image URL or path for submenu items (typically used for submenus)';
COMMENT ON COLUMN navigation_items.order_index IS 'Order in which items appear in the menu';
COMMENT ON COLUMN navigation_items.metadata IS 'Additional JSON data for custom properties';
