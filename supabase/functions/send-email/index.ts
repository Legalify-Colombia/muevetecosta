
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  templateName: string;
  recipientEmail: string;
  templateData: Record<string, string>;
  userId?: string;
}

const getConfiguredSender = (emailConfig: any) => {
  const defaultSenderEmail = Deno.env.get('DEFAULT_SENDER_EMAIL')
    ?? emailConfig?.default_sender_email
    ?? 'noreply@mueveteporlacosta.com';

  const defaultSenderName = Deno.env.get('DEFAULT_SENDER_NAME')
    ?? emailConfig?.default_sender_name
    ?? 'Muévete por el Caribe';

  return {
    defaultSenderEmail,
    defaultSenderName,
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { templateName, recipientEmail, templateData, userId }: SendEmailRequest = await req.json();

    // Get email configuration
    const { data: emailConfig, error: configError } = await supabase
      .from('email_configuration')
      .select('*')
      .eq('is_active', true)
      .single();

    if (configError && configError.code !== 'PGRST116') {
      throw new Error(`Email configuration lookup failed: ${configError.message}`);
    }

    // Get email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_name', templateName)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    // Replace variables in subject and content
    let subject = template.template_subject;
    let htmlContent = template.template_html_content;

    for (const [key, value] of Object.entries(templateData)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      subject = subject.replace(regex, value);
      htmlContent = htmlContent.replace(regex, value);
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
      ?? emailConfig?.resend_api_key
      ?? '';

    if (!resendApiKey) {
      throw new Error('Resend API key not configured in function secrets or email_configuration');
    }

    const { defaultSenderEmail, defaultSenderName } = getConfiguredSender(emailConfig);

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    // Create email history record
    const { data: historyRecord, error: historyError } = await supabase
      .from('email_history')
      .insert([{
        template_name: templateName,
        recipient_email: recipientEmail,
        subject: subject,
        status: 'pending',
        user_id: userId || null
      }])
      .select()
      .single();

    if (historyError) {
      console.error('Error creating email history record:', historyError);
    }

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${defaultSenderName} <${defaultSenderEmail}>`,
      to: [recipientEmail],
      subject: subject,
      html: htmlContent,
    });

    // Update history record with result
    if (historyRecord) {
      const updateData = emailError 
        ? {
            status: 'failed',
            error_message: emailError.message || 'Unknown error'
          }
        : {
            status: 'sent',
            sent_at: new Date().toISOString()
          };

      await supabase
        .from('email_history')
        .update(updateData)
        .eq('id', historyRecord.id);
    }

    if (emailError) {
      throw emailError;
    }

    console.log('Email sent successfully:', emailData);

    return new Response(JSON.stringify({ 
      success: true, 
      data: emailData,
      historyId: historyRecord?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error' 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
