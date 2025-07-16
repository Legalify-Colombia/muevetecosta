
-- Create mobility applications table
CREATE TABLE public.mobility_applications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    application_number TEXT NOT NULL,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    destination_university_id UUID REFERENCES public.universities(id),
    destination_program_id UUID REFERENCES public.academic_programs(id),
    status application_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for course equivalences/homologation
CREATE TABLE public.course_equivalences (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID REFERENCES public.mobility_applications(id) ON DELETE CASCADE,
    origin_course_name TEXT NOT NULL,
    origin_course_code TEXT,
    destination_course_id UUID REFERENCES public.courses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for application documents
CREATE TABLE public.application_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID REFERENCES public.mobility_applications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'cv', 'homologation_contract', 'academic_record'
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create application notes table for coordinator comments
CREATE TABLE public.application_notes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES public.mobility_applications(id) ON DELETE CASCADE,
    coordinator_id UUID NOT NULL REFERENCES public.profiles(id),
    note TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT true, -- true for internal notes, false for student-visible
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    related_application_id UUID REFERENCES public.mobility_applications(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add personal and academic information fields to student_info table
ALTER TABLE public.student_info 
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS birth_place TEXT,
ADD COLUMN IF NOT EXISTS birth_country TEXT,
ADD COLUMN IF NOT EXISTS blood_type TEXT,
ADD COLUMN IF NOT EXISTS health_insurance TEXT,
ADD COLUMN IF NOT EXISTS origin_institution_campus TEXT,
ADD COLUMN IF NOT EXISTS origin_faculty TEXT,
ADD COLUMN IF NOT EXISTS student_code TEXT,
ADD COLUMN IF NOT EXISTS cumulative_gpa DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS academic_director_name TEXT,
ADD COLUMN IF NOT EXISTS academic_director_phone TEXT,
ADD COLUMN IF NOT EXISTS academic_director_email TEXT;

-- Create function to generate application numbers
CREATE OR REPLACE FUNCTION public.generate_application_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    next_number INTEGER;
    formatted_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(application_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.mobility_applications
    WHERE application_number LIKE 'MOV-%';
    
    formatted_number := 'MOV-' || LPAD(next_number::TEXT, 6, '0');
    RETURN formatted_number;
END;
$$;

-- Create trigger to auto-generate application numbers
CREATE OR REPLACE FUNCTION public.set_application_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.application_number IS NULL OR NEW.application_number = '' THEN
        NEW.application_number := public.generate_application_number();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_application_number_trigger
    BEFORE INSERT ON public.mobility_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.set_application_number();

-- Enable RLS on all new tables
ALTER TABLE public.mobility_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_equivalences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mobility_applications
CREATE POLICY "Students can view their own applications" 
    ON public.mobility_applications 
    FOR SELECT 
    USING (student_id = auth.uid());

CREATE POLICY "Students can create applications" 
    ON public.mobility_applications 
    FOR INSERT 
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Coordinators can view applications to their university" 
    ON public.mobility_applications 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM universities 
            WHERE universities.id = mobility_applications.destination_university_id 
            AND universities.coordinator_id = auth.uid()
        )
    );

CREATE POLICY "Coordinators can update application status" 
    ON public.mobility_applications 
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM universities u
            WHERE u.id = mobility_applications.destination_university_id 
            AND u.coordinator_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all applications" 
    ON public.mobility_applications 
    FOR SELECT 
    USING (get_current_user_role() = 'admin');

-- RLS Policies for course_equivalences
CREATE POLICY "Students can manage their course equivalences" 
    ON public.course_equivalences 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM mobility_applications 
            WHERE mobility_applications.id = course_equivalences.application_id 
            AND mobility_applications.student_id = auth.uid()
        )
    );

CREATE POLICY "Coordinators can view course equivalences for their university" 
    ON public.course_equivalences 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM mobility_applications ma
            JOIN universities u ON ma.destination_university_id = u.id
            WHERE ma.id = course_equivalences.application_id 
            AND u.coordinator_id = auth.uid()
        )
    );

-- RLS Policies for application_documents
CREATE POLICY "Students can manage their application documents" 
    ON public.application_documents 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM mobility_applications 
            WHERE mobility_applications.id = application_documents.application_id 
            AND mobility_applications.student_id = auth.uid()
        )
    );

CREATE POLICY "Coordinators can view documents for their university applications" 
    ON public.application_documents 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM mobility_applications ma
            JOIN universities u ON ma.destination_university_id = u.id
            WHERE ma.id = application_documents.application_id 
            AND u.coordinator_id = auth.uid()
        )
    );

-- RLS Policies for application_notes
CREATE POLICY "Coordinators can manage application notes" 
    ON public.application_notes 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM mobility_applications ma
            JOIN universities u ON ma.destination_university_id = u.id
            WHERE ma.id = application_notes.application_id 
            AND u.coordinator_id = auth.uid()
        )
    );

CREATE POLICY "Students can view public application notes" 
    ON public.application_notes 
    FOR SELECT 
    USING (
        is_internal = false AND 
        EXISTS (
            SELECT 1 FROM mobility_applications ma
            WHERE ma.id = application_notes.application_id 
            AND ma.student_id = auth.uid()
        )
    );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" 
    ON public.notifications 
    FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
    ON public.notifications 
    FOR UPDATE 
    USING (user_id = auth.uid());

CREATE POLICY "Coordinators can create student notifications" 
    ON public.notifications 
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM mobility_applications ma
            JOIN universities u ON ma.destination_university_id = u.id
            WHERE ma.student_id = notifications.user_id 
            AND u.coordinator_id = auth.uid()
        ) OR user_id = auth.uid()
    );
