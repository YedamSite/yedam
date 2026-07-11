-- =========================================================================
-- Supabase Storage Setup for Yedam K-Beauty Image Uploads
-- Execute this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)
-- =========================================================================

-- 1. Create the storage bucket for Yedam images
-- (You can also create it manually in Dashboard > Storage > New Bucket)
-- Bucket name: yedam-images
-- Public bucket: YES

-- 2. Set up RLS policies for the storage bucket
-- Allow public read access to all files
CREATE POLICY "Public Read Access" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'yedam-images');

-- Allow authenticated users (including anon) to upload files
CREATE POLICY "Public Upload Access" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'yedam-images');

-- Allow authenticated users to update their own files
CREATE POLICY "Public Update Access" ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'yedam-images');

-- Allow public delete access
CREATE POLICY "Public Delete Access" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'yedam-images');

-- 3. Note: The bucket must exist before these policies take effect.
--    Create the bucket manually in the Supabase Dashboard:
--    Storage > Create bucket > Name: "yedam-images" > Public bucket: ON
