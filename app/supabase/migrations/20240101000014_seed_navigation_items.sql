-- Seed navigation items with sample data
-- This migration inserts initial navigation items for the site

-- Insert top-level navigation items
INSERT INTO public.navigation_items (id, parent_id, label, href, icon, order_index, is_active, is_external, target, metadata)
VALUES
  -- Home
  ('00000000-0000-0000-0000-000000000001', NULL, 'Home', '/', 'home', 0, true, false, '_self', '{}'::jsonb),
  
  -- About (with submenus)
  ('00000000-0000-0000-0000-000000000002', NULL, 'About', '/about', 'info', 1, true, false, '_self', '{}'::jsonb),
  
  -- Events
  ('00000000-0000-0000-0000-000000000003', NULL, 'Events', '/events', 'calendar', 2, true, false, '_self', '{}'::jsonb),
  
  -- Resources (with submenus)
  ('00000000-0000-0000-0000-000000000004', NULL, 'Resources', NULL, 'book', 3, true, false, '_self', '{}'::jsonb),
  
  -- Contact
  ('00000000-0000-0000-0000-000000000005', NULL, 'Contact', '/contact', 'mail', 4, true, false, '_self', '{}'::jsonb),
  
  -- Join
  ('00000000-0000-0000-0000-000000000006', NULL, 'Join', '/join', 'user-plus', 5, true, false, '_self', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert submenu items under "About"
INSERT INTO public.navigation_items (id, parent_id, label, href, icon, order_index, is_active, is_external, target, metadata)
VALUES
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000002', 'Our Story', '/about/story', NULL, 0, true, false, '_self', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002', 'Team', '/about/team', NULL, 1, true, false, '_self', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000002', 'Mission', '/about/mission', NULL, 2, true, false, '_self', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert submenu items under "Resources"
INSERT INTO public.navigation_items (id, parent_id, label, href, icon, order_index, is_active, is_external, target, metadata)
VALUES
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000004', 'Documentation', '/resources/docs', NULL, 0, true, false, '_self', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000004', 'Tutorials', '/resources/tutorials', NULL, 1, true, false, '_self', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000004', 'Blog', '/resources/blog', NULL, 2, true, false, '_self', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000004', 'External Link', 'https://example.com', NULL, 3, true, true, '_blank', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE public.navigation_items IS 'Navigation menu items seeded with initial data';
