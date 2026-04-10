
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendEmailParams {
  templateName: string;
  recipientEmail: string;
  templateData: Record<string, string>;
  userId?: string;
}

export const useEmail = () => {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const sendEmail = async ({ templateName, recipientEmail, templateData, userId }: SendEmailParams) => {
    setSending(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          templateName,
          recipientEmail,
          templateData,
          userId
        },
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to send email');
      }

      console.log('Email sent successfully:', data);
      return { success: true, data: data.data };

    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Error al enviar correo",
        description: error.message || "No se pudo enviar el correo electrónico",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setSending(false);
    }
  };

  const sendWelcomeEmail = async (userEmail: string, userName: string, activationLink?: string) => {
    return sendEmail({
      templateName: 'user_registration',
      recipientEmail: userEmail,
      templateData: {
        nombre_usuario: userName,
        link_activacion: activationLink || '#',
        link_login: `${window.location.origin}/login`,
        email_usuario: userEmail
      }
    });
  };

  const sendApplicationConfirmation = async (
    applicantEmail: string,
    applicantName: string,
    applicationNumber: string,
    universityName: string,
    programName: string,
    userId?: string
  ) => {
    return sendEmail({
      templateName: 'application_confirmation_student',
      recipientEmail: applicantEmail,
      templateData: {
        nombre_postulante: applicantName,
        numero_radicacion: applicationNumber,
        nombre_universidad_destino: universityName,
        programa_postulacion: programName
      },
      userId
    });
  };

  const sendApplicationStatusUpdate = async (
    applicantEmail: string,
    applicantName: string,
    applicationNumber: string,
    newStatus: string,
    coordinatorComment: string,
    trackingLink: string,
    userId?: string
  ) => {
    return sendEmail({
      templateName: 'application_status_update',
      recipientEmail: applicantEmail,
      templateData: {
        nombre_postulante: applicantName,
        numero_radicacion: applicationNumber,
        estado_nuevo: newStatus,
        comentario_coordinador: coordinatorComment,
        link_seguimiento: trackingLink
      },
      userId
    });
  };

  const sendNewApplicationNotification = async (
    coordinatorEmail: string,
    coordinatorName: string,
    applicantName: string,
    applicationNumber: string,
    originUniversity: string,
    destinationProgram: string,
    applicationDetailLink: string
  ) => {
    return sendEmail({
      templateName: 'new_application_coordinator',
      recipientEmail: coordinatorEmail,
      templateData: {
        nombre_coordinador: coordinatorName,
        nombre_postulante: applicantName,
        numero_radicacion: applicationNumber,
        universidad_origen: originUniversity,
        programa_destino: destinationProgram,
        link_detalle_postulacion: applicationDetailLink
      }
    });
  };

  return {
    sendEmail,
    sendWelcomeEmail,
    sendApplicationConfirmation,
    sendApplicationStatusUpdate,
    sendNewApplicationNotification,
    sending
  };
};
