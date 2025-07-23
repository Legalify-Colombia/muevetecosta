-- Create professor_mobility_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.professor_mobility_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.professor_mobility_documents
ADD CONSTRAINT professor_mobility_documents_application_id_fkey
FOREIGN KEY (application_id) REFERENCES public.professor_mobility_applications(id) ON DELETE CASCADE;

ALTER TABLE public.professor_mobility_documents
ADD CONSTRAINT professor_mobility_documents_uploaded_by_fkey
FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id);

-- Enable RLS
ALTER TABLE public.professor_mobility_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for professor_mobility_documents
CREATE POLICY "Professors can manage their own application documents"
ON public.professor_mobility_documents
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.professor_mobility_applications pma
    WHERE pma.id = professor_mobility_documents.application_id 
    AND pma.professor_id = auth.uid()
  )
);

CREATE POLICY "Coordinators can view professor documents for their university"
ON public.professor_mobility_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.professor_mobility_applications pma
    JOIN public.professor_mobility_calls pmc ON pma.mobility_call_id = pmc.id
    JOIN public.universities u ON pmc.host_university_id = u.id
    WHERE pma.id = professor_mobility_documents.application_id 
    AND u.coordinator_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all professor documents"
ON public.professor_mobility_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
  )
);

-- Add professor_mobility_notes table for coordinator comments
CREATE TABLE IF NOT EXISTS public.professor_mobility_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  coordinator_id UUID NOT NULL,
  note TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints for notes
ALTER TABLE public.professor_mobility_notes
ADD CONSTRAINT professor_mobility_notes_application_id_fkey
FOREIGN KEY (application_id) REFERENCES public.professor_mobility_applications(id) ON DELETE CASCADE;

ALTER TABLE public.professor_mobility_notes
ADD CONSTRAINT professor_mobility_notes_coordinator_id_fkey
FOREIGN KEY (coordinator_id) REFERENCES public.profiles(id);

-- Enable RLS for notes
ALTER TABLE public.professor_mobility_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for professor_mobility_notes
CREATE POLICY "Coordinators can manage professor application notes"
ON public.professor_mobility_notes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.professor_mobility_applications pma
    JOIN public.professor_mobility_calls pmc ON pma.mobility_call_id = pmc.id
    JOIN public.universities u ON pmc.host_university_id = u.id
    WHERE pma.id = professor_mobility_notes.application_id 
    AND u.coordinator_id = auth.uid()
  )
);

CREATE POLICY "Professors can view public notes on their applications"
ON public.professor_mobility_notes
FOR SELECT
USING (
  is_internal = false AND 
  EXISTS (
    SELECT 1 FROM public.professor_mobility_applications pma
    WHERE pma.id = professor_mobility_notes.application_id 
    AND pma.professor_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all professor notes"
ON public.professor_mobility_notes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
  )
);