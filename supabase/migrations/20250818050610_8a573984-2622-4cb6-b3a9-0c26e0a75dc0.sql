-- Create COIL projects tables
CREATE TABLE public.coil_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  objectives TEXT,
  start_date DATE,
  end_date DATE,
  coordinator_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'active',
  max_participants INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_public BOOLEAN DEFAULT true,
  requirements TEXT,
  benefits TEXT
);

-- Enable RLS on coil_projects
ALTER TABLE public.coil_projects ENABLE ROW LEVEL SECURITY;

-- Create COIL project participants table
CREATE TABLE public.coil_project_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.coil_projects(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  role TEXT DEFAULT 'participant',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(project_id, professor_id)
);

-- Enable RLS on coil_project_participants
ALTER TABLE public.coil_project_participants ENABLE ROW LEVEL SECURITY;

-- Create COIL project applications table
CREATE TABLE public.coil_project_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.coil_projects(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  motivation TEXT NOT NULL,
  experience TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  UNIQUE(project_id, professor_id)
);

-- Enable RLS on coil_project_applications
ALTER TABLE public.coil_project_applications ENABLE ROW LEVEL SECURITY;

-- Create COIL project documents table
CREATE TABLE public.coil_project_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.coil_projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  document_type TEXT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_public BOOLEAN DEFAULT false
);

-- Enable RLS on coil_project_documents
ALTER TABLE public.coil_project_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for COIL projects
CREATE POLICY "Everyone can view public COIL projects" 
ON public.coil_projects 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Coordinators can manage COIL projects" 
ON public.coil_projects 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('coordinator', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('coordinator', 'admin')
  )
);

-- RLS Policies for COIL project participants
CREATE POLICY "Participants can view their own participation" 
ON public.coil_project_participants 
FOR SELECT 
USING (professor_id = auth.uid());

CREATE POLICY "Coordinators can manage project participants" 
ON public.coil_project_participants 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('coordinator', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('coordinator', 'admin')
  )
);

-- RLS Policies for COIL project applications
CREATE POLICY "Professors can create their own applications" 
ON public.coil_project_applications 
FOR INSERT 
WITH CHECK (professor_id = auth.uid());

CREATE POLICY "Professors can view their own applications" 
ON public.coil_project_applications 
FOR SELECT 
USING (professor_id = auth.uid());

CREATE POLICY "Coordinators can manage all applications" 
ON public.coil_project_applications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('coordinator', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('coordinator', 'admin')
  )
);

-- RLS Policies for COIL project documents
CREATE POLICY "Project participants can view documents" 
ON public.coil_project_documents 
FOR SELECT 
USING (
  is_public = true OR 
  EXISTS (
    SELECT 1 FROM coil_project_participants cpp 
    WHERE cpp.project_id = coil_project_documents.project_id 
    AND cpp.professor_id = auth.uid() 
    AND cpp.status = 'approved'
  )
);

CREATE POLICY "Project participants can upload documents" 
ON public.coil_project_documents 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM coil_project_participants cpp 
    WHERE cpp.project_id = coil_project_documents.project_id 
    AND cpp.professor_id = auth.uid() 
    AND cpp.status = 'approved'
  )
);

-- Create storage bucket for COIL documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('coil-documents', 'coil-documents', false);

-- Create storage policies for COIL documents
CREATE POLICY "Project participants can view COIL documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'coil-documents' AND 
  EXISTS (
    SELECT 1 FROM coil_project_participants cpp 
    JOIN coil_project_documents cpd ON cpd.project_id = cpp.project_id
    WHERE cpp.professor_id = auth.uid() 
    AND cpp.status = 'approved'
    AND storage.foldername(name) = cpd.project_id::text
  )
);

CREATE POLICY "Project participants can upload COIL documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'coil-documents' AND 
  EXISTS (
    SELECT 1 FROM coil_project_participants cpp 
    WHERE cpp.project_id::text = (storage.foldername(name))[1]
    AND cpp.professor_id = auth.uid() 
    AND cpp.status = 'approved'
  )
);

-- Update professor_info table for public profiles
ALTER TABLE public.professor_info 
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS orcid_id TEXT,
ADD COLUMN IF NOT EXISTS is_public_profile BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS google_scholar_url TEXT;

-- Create trigger for updating COIL projects
CREATE OR REPLACE FUNCTION public.update_coil_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coil_projects_updated_at
BEFORE UPDATE ON public.coil_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_coil_projects_updated_at();