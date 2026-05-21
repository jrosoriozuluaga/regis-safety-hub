-- DRAFT — NO APLICAR AUTOMATICAMENTE. Revisar y aplicar manualmente.
--
-- ==========================================================================
-- Migration 005 (DRAFT): Secure the 'documentos' storage bucket
-- ==========================================================================
--
-- WHAT THIS DOES:
--   1. Makes the 'documentos' bucket private (public = false)
--   2. Creates a helper function to resolve the current user's empresa_id
--   3. Adds RLS policies on storage.objects so that:
--        - Admin/consultor can read ALL objects in the bucket
--        - Cliente can only read objects under their empresa_id folder
--        - Admin/consultor can upload anywhere in the bucket
--        - Cliente can only upload under their empresa_id folder
--        - Anonymous users can upload to 'pila/%' paths (public upload flow)
--        - Only admin can delete objects
--   4. Includes a commented-out rollback section at the bottom
--
-- WHY:
--   The bucket is currently public, meaning anyone with a direct URL can
--   download PILA planillas, medical exams, and other sensitive documents.
--   These contain employee PII (cedulas, salaries, health data).
--
-- STORAGE PATH CONVENTION:
--   {module}/{empresa_id}/{filename}
--   Examples:
--     pila/a1b2c3d4-.../planilla_2026-01.pdf
--     examenes/a1b2c3d4-.../ingreso_juan.pdf
--
-- PREREQUISITES:
--   - The `usuarios` table must exist with columns:
--       id, auth_user_id (references auth.users), email, nombre, rol, empresa_id
--   - The bucket 'documentos' must already exist
--
-- NOTES:
--   - The public upload-pila flow (/upload-pila?t=base64token) uses the
--     Supabase anon key (no auth). The anonymous INSERT policy allows this
--     but restricts uploads to the 'pila/' prefix only.
--   - Edge Functions use the service_role key, which bypasses RLS entirely,
--     so they are NOT affected by these policies.
--
-- ==========================================================================


-- =========================================================================
-- 1. Helper function: get the empresa_id for the currently authenticated user
-- =========================================================================
-- Returns NULL if no matching row in usuarios (e.g., service-role calls).
-- SECURITY DEFINER so it can read `usuarios` regardless of RLS on that table.

CREATE OR REPLACE FUNCTION public.get_user_empresa_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT empresa_id
  FROM public.usuarios
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_user_empresa_id() IS
  'Returns the empresa_id linked to the current auth user. Used by storage RLS policies.';


-- Helper: get the rol for the currently authenticated user
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rol
  FROM public.usuarios
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_user_role() IS
  'Returns the app-level role (admin, consultor, cliente) for the current auth user.';


-- =========================================================================
-- 2. Make the bucket private
-- =========================================================================
-- After this, direct URLs (without a valid auth token or signed URL) will
-- return 403. All access goes through RLS policies below.

UPDATE storage.buckets
SET public = false
WHERE id = 'documentos';


-- =========================================================================
-- 3. RLS policies on storage.objects for bucket = 'documentos'
-- =========================================================================
-- Supabase storage uses the `storage.objects` table. The `bucket_id` column
-- identifies the bucket, and `name` is the full object path (e.g.,
-- 'pila/uuid-here/file.pdf').
--
-- We use (storage.foldername(name))[1] to extract the first path segment
-- (the module), and (storage.foldername(name))[2] to extract the second
-- segment (the empresa_id).
--
-- Note: storage.foldername() returns an array of folder segments. For a
-- path like 'pila/abc-123/file.pdf':
--   (storage.foldername(name))[1] = 'pila'
--   (storage.foldername(name))[2] = 'abc-123'


-- -------------------------------------------------------------------------
-- SELECT policies (downloading / viewing files)
-- -------------------------------------------------------------------------

-- Policy: Admin and consultor can read ALL files in the bucket.
-- Rationale: Admins manage the platform; consultores work across all
-- client companies and need access to all documents.
CREATE POLICY "storage_select_admin_consultor"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos'
  AND public.get_user_role() IN ('admin', 'consultor')
);

-- Policy: Cliente can only read files under their own empresa_id folder.
-- The empresa_id is the second segment of the path: {module}/{empresa_id}/...
-- This ensures a client from Company A cannot see Company B's documents.
CREATE POLICY "storage_select_cliente"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos'
  AND public.get_user_role() = 'cliente'
  AND (storage.foldername(name))[2]::uuid = public.get_user_empresa_id()
);


-- -------------------------------------------------------------------------
-- INSERT policies (uploading files)
-- -------------------------------------------------------------------------

-- Policy: Admin and consultor can upload files anywhere in the bucket.
CREATE POLICY "storage_insert_admin_consultor"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos'
  AND public.get_user_role() IN ('admin', 'consultor')
);

-- Policy: Cliente can only upload files under their own empresa_id folder.
-- The path must follow {module}/{empresa_id}/{filename}.
CREATE POLICY "storage_insert_cliente"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos'
  AND public.get_user_role() = 'cliente'
  AND (storage.foldername(name))[2]::uuid = public.get_user_empresa_id()
);

-- Policy: Anonymous (unauthenticated) users can upload to 'pila/%' paths ONLY.
-- This supports the public PILA upload flow (/upload-pila?t=base64token).
-- The token validation happens at the application layer; this policy only
-- restricts anonymous uploads to the pila/ prefix so they cannot write to
-- other modules (examenes, planes, etc.).
CREATE POLICY "storage_insert_anon_pila"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'documentos'
  AND (storage.foldername(name))[1] = 'pila'
);


-- -------------------------------------------------------------------------
-- UPDATE policies (replacing/overwriting files)
-- -------------------------------------------------------------------------

-- Policy: Admin and consultor can update (overwrite) any file.
CREATE POLICY "storage_update_admin_consultor"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documentos'
  AND public.get_user_role() IN ('admin', 'consultor')
)
WITH CHECK (
  bucket_id = 'documentos'
  AND public.get_user_role() IN ('admin', 'consultor')
);

-- Policy: Cliente can update files in their own empresa_id folder.
CREATE POLICY "storage_update_cliente"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documentos'
  AND public.get_user_role() = 'cliente'
  AND (storage.foldername(name))[2]::uuid = public.get_user_empresa_id()
)
WITH CHECK (
  bucket_id = 'documentos'
  AND public.get_user_role() = 'cliente'
  AND (storage.foldername(name))[2]::uuid = public.get_user_empresa_id()
);


-- -------------------------------------------------------------------------
-- DELETE policies
-- -------------------------------------------------------------------------

-- Policy: Only admin can delete files from the bucket.
-- Rationale: Deletion of compliance documents should be restricted to
-- prevent accidental or unauthorized removal of audit-critical files.
CREATE POLICY "storage_delete_admin_only"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentos'
  AND public.get_user_role() = 'admin'
);


-- =========================================================================
-- ROLLBACK (commented out) — revert to public bucket, remove all policies
-- =========================================================================
-- To undo this migration, uncomment and run the following:
--
-- -- 1. Drop all storage policies
-- DROP POLICY IF EXISTS "storage_select_admin_consultor" ON storage.objects;
-- DROP POLICY IF EXISTS "storage_select_cliente"         ON storage.objects;
-- DROP POLICY IF EXISTS "storage_insert_admin_consultor" ON storage.objects;
-- DROP POLICY IF EXISTS "storage_insert_cliente"         ON storage.objects;
-- DROP POLICY IF EXISTS "storage_insert_anon_pila"       ON storage.objects;
-- DROP POLICY IF EXISTS "storage_update_admin_consultor" ON storage.objects;
-- DROP POLICY IF EXISTS "storage_update_cliente"         ON storage.objects;
-- DROP POLICY IF EXISTS "storage_delete_admin_only"      ON storage.objects;
--
-- -- 2. Make bucket public again
-- UPDATE storage.buckets SET public = true WHERE id = 'documentos';
--
-- -- 3. Drop helper functions
-- DROP FUNCTION IF EXISTS public.get_user_empresa_id();
-- DROP FUNCTION IF EXISTS public.get_user_role();
--
-- =========================================================================
-- END OF DRAFT
-- =========================================================================
