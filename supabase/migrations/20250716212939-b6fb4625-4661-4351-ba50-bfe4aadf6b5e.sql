
-- Create courses table to store detailed course information by program and semester
CREATE TABLE public.courses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    program_id UUID REFERENCES public.academic_programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT, -- Optional course code
    credits INTEGER,
    semester INTEGER, -- Which semester this course belongs to
    description TEXT,
    syllabus_url TEXT, -- URL to uploaded syllabus or external link
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Coordinators can manage courses for their university programs
CREATE POLICY "Coordinators can manage their university courses" 
    ON public.courses 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 
            FROM academic_programs ap
            JOIN universities u ON ap.university_id = u.id
            WHERE ap.id = courses.program_id 
            AND u.coordinator_id = auth.uid()
        )
    );

-- Everyone can view active courses (for students browsing programs)
CREATE POLICY "Everyone can view active courses" 
    ON public.courses 
    FOR SELECT 
    USING (is_active = true);

-- Add duration_semesters to academic_programs if not exists
ALTER TABLE public.academic_programs 
ADD COLUMN IF NOT EXISTS duration_semesters INTEGER DEFAULT 10;
