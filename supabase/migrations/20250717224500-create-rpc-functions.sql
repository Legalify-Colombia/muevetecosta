
-- Crear función RPC para obtener convocatorias de movilidad de profesores con universidades
CREATE OR REPLACE FUNCTION get_professor_mobility_calls_with_universities()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  mobility_type TEXT,
  start_date DATE,
  end_date DATE,
  application_deadline DATE,
  host_university_id UUID,
  max_participants INTEGER,
  requirements TEXT,
  benefits TEXT,
  duration_weeks INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  universities JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pmc.id,
    pmc.title,
    pmc.description,
    pmc.mobility_type,
    pmc.start_date,
    pmc.end_date,
    pmc.application_deadline,
    pmc.host_university_id,
    pmc.max_participants,
    pmc.requirements,
    pmc.benefits,
    pmc.duration_weeks,
    pmc.is_active,
    pmc.created_at,
    pmc.updated_at,
    CASE 
      WHEN u.id IS NOT NULL THEN 
        jsonb_build_object('name', u.name, 'city', u.city)
      ELSE NULL
    END as universities
  FROM professor_mobility_calls pmc
  LEFT JOIN universities u ON pmc.host_university_id = u.id
  ORDER BY pmc.created_at DESC;
END;
$$;
