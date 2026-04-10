import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email }: ResetPasswordRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Generar OTP y obtener detalles
    const { data: resetData, error: resetError } = await supabase.rpc(
      'send_password_reset_email',
      { user_email: email }
    );

    if (resetError || !resetData?.success) {
      console.error('Reset error:', resetError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: resetData?.error || 'No se pudo procesar la solicitud' 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Obtener configuración de email
    const { data: emailConfig, error: configError } = await supabase
      .from('email_configuration')
      .select('*')
      .eq('is_active', true)
      .single();

    if (configError || !emailConfig?.resend_api_key) {
      console.error('Email configuration error:', configError);
      return new Response(
        JSON.stringify({ success: false, error: 'Email configuration not found' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Inicializar Resend
    const resend = new Resend(emailConfig.resend_api_key);

    // Preparar HTML del email
    const resetCode = resetData.code;
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="${emailConfig.logo_url || 'https://mueveteporlacosta.com.co/logo.png'}" alt="Logo" style="max-width: 200px; height: auto;">
      </div>
      
      <h2 style="color: #333; text-align: center;">Recupera tu Contraseña</h2>
      
      <p style="color: #666; font-size: 16px; line-height: 1.5;">
        Hemos recibido una solicitud para resetear tu contraseña. Usa el código de verificación que aparece abajo:
      </p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; margin-bottom: 10px;">CÓDIGO DE VERIFICACIÓN</p>
        <p style="font-size: 36px; font-weight: bold; color: #007bff; letter-spacing: 10px; margin: 0;">
          ${resetCode}
        </p>
      </div>
      
      <p style="color: #666; font-size: 14px; line-height: 1.5;">
        Este código expira en 30 minutos. Si no solicitaste cambiar tu contraseña, ignora este email.
      </p>
      
      <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
        Este es un email automático, por favor no respondas a this address.
      </p>
    </div>
    `;

    // Enviar email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: emailConfig.default_sender_email,
      to: [email],
      subject: 'Código de Recuperación de Contraseña - Muévete por el Caribe',
      html: htmlContent,
    });

    if (emailError) {
      console.error('Email send error:', emailError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send email' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Registrar en historial
    await supabase
      .from('email_history')
      .insert([{
        template_name: 'password_reset',
        recipient_email: email,
        subject: 'Código de Recuperación de Contraseña - Muévete por el Caribe',
        status: 'sent',
        user_id: resetData.user_id
      }]);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Se ha enviado un código a tu email',
        email: email
      }),
      { headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
};

serve(handler);
