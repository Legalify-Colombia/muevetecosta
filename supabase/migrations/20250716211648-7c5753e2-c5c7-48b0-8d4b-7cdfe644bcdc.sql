
-- Add table for application comments/notes by coordinators
CREATE TABLE public.application_notes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID REFERENCES public.mobility_applications(id) ON DELETE CASCADE NOT NULL,
    coordinator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    note TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT true, -- true for internal notes, false for student notifications
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for application notes
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;

-- Coordinators can manage notes for applications to their university
CREATE POLICY "Coordinators can manage application notes" 
    ON public.application_notes 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 
            FROM mobility_applications ma
            JOIN universities u ON ma.destination_university_id = u.id
            WHERE ma.id = application_notes.application_id 
            AND u.coordinator_id = auth.uid()
        )
    );

-- Students can view non-internal notes on their applications
CREATE POLICY "Students can view public application notes" 
    ON public.application_notes 
    FOR SELECT 
    USING (
        is_internal = false 
        AND EXISTS (
            SELECT 1 
            FROM mobility_applications ma
            WHERE ma.id = application_notes.application_id 
            AND ma.student_id = auth.uid()
        )
    );

-- Update mobility_applications to allow coordinators to update status
DROP POLICY IF EXISTS "Coordinators can update application status" ON public.mobility_applications;
CREATE POLICY "Coordinators can update application status" 
    ON public.mobility_applications 
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 
            FROM universities u
            WHERE u.id = mobility_applications.destination_university_id 
            AND u.coordinator_id = auth.uid()
        )
    );

-- Add notification system table
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    is_read BOOLEAN DEFAULT false,
    related_application_id UUID REFERENCES public.mobility_applications(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" 
    ON public.notifications 
    FOR SELECT 
    USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
    ON public.notifications 
    FOR UPDATE 
    USING (user_id = auth.uid());

-- Coordinators can create notifications for students with applications to their university
CREATE POLICY "Coordinators can create student notifications" 
    ON public.notifications 
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM mobility_applications ma
            JOIN universities u ON ma.destination_university_id = u.id
            WHERE ma.student_id = notifications.user_id 
            AND u.coordinator_id = auth.uid()
        )
        OR user_id = auth.uid() -- Can create notifications for themselves
    );
