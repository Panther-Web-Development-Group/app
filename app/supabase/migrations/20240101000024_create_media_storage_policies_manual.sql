-- Storage bucket policies for the 'media' bucket
-- 
-- This file contains the SQL to create storage policies.
-- Run this manually in Supabase Dashboard → SQL Editor with service role permissions,
-- or use Supabase CLI with service role key.
--
-- Prerequisites:
-- 1. Create the 'media' bucket in Supabase Dashboard → Storage
-- 2. Ensure you have service role permissions

-- =========================
-- Storage Policies for 'media' bucket
-- =========================

-- Policy: Authenticated users can upload files to their own folder
DROP POLICY IF EXISTS "Authenticated users can upload to their own folder" ON storage.objects;
CREATE POLICY "Authenticated users can upload to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  starts_with(name, auth.uid()::text || '/')
);

-- Policy: Authenticated users can read files from their own folder
DROP POLICY IF EXISTS "Authenticated users can read their own files" ON storage.objects;
CREATE POLICY "Authenticated users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'media' AND
  starts_with(name, auth.uid()::text || '/')
);

-- Policy: Public read access for files in the media bucket (OPTIONAL)
-- Remove this policy if you want all files to be private
DROP POLICY IF EXISTS "Public can read media files" ON storage.objects;
CREATE POLICY "Public can read media files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');

-- Policy: Authenticated users can update files in their own folder
DROP POLICY IF EXISTS "Authenticated users can update their own files" ON storage.objects;
CREATE POLICY "Authenticated users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND
  starts_with(name, auth.uid()::text || '/')
)
WITH CHECK (
  bucket_id = 'media' AND
  starts_with(name, auth.uid()::text || '/')
);

-- Policy: Authenticated users can delete files from their own folder
DROP POLICY IF EXISTS "Authenticated users can delete their own files" ON storage.objects;
CREATE POLICY "Authenticated users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  starts_with(name, auth.uid()::text || '/')
);
