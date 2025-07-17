
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

    if (configError || !emailConfig?.resend_api_key) {
      throw new Error('Email configuration not found or Resend API key not configured');
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

    // Initialize Resend
    const resend = new Resend(emailConfig.resend_api_key);

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
      from: `${emailConfig.default_sender_name} <${emailConfig.default_sender_email}>`,
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
