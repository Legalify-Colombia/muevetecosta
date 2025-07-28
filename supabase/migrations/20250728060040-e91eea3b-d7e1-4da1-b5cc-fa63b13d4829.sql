-- Add origin_university_id to student_info table for coordinator tracking
ALTER TABLE public.student_info 
ADD COLUMN origin_university_id UUID REFERENCES public.universities(id);

-- Create index for performance
CREATE INDEX idx_student_info_origin_university_id ON public.student_info(origin_university_id);

-- Add a helper view for coordinators to see their students' applications
CREATE OR REPLACE VIEW coordinator_students_view AS
SELECT 
    p.id as student_id,
    p.full_name as student_name,
    p.document_number,
    si.academic_program,
    si.current_semester,
    ou.name as origin_university_name,
    ou.id as origin_university_id,
    ma.id as application_id,
    ma.application_number,
    ma.status as application_status,
    ma.created_at as application_date,
    du.name as destination_university_name,
    ap.name as destination_program_name
FROM profiles p
JOIN student_info si ON p.id = si.id
LEFT JOIN universities ou ON si.origin_university_id = ou.id
LEFT JOIN mobility_applications ma ON p.id = ma.student_id
LEFT JOIN universities du ON ma.destination_university_id = du.id
LEFT JOIN academic_programs ap ON ma.destination_program_id = ap.id
WHERE p.role = 'student';