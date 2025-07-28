-- Fix storage policies for template-documents bucket
-- First, ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('template-documents', 'template-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create policies for template-documents bucket
CREATE POLICY "Template documents are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'template-documents');

CREATE POLICY "Authenticated users can upload template documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'template-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own template documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'template-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own template documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'template-documents' AND auth.role() = 'authenticated');