import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordWithCodeRequest {
  code: string;
  newPassword: string;
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

    const { code, newPassword }: ResetPasswordWithCodeRequest = await req.json();

    if (!code || !newPassword) {
      return new Response(
        JSON.stringify({ success: false, error: "Code and newPassword are required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (newPassword.length < 8) {
      return new Response(
        JSON.stringify({ success: false, error: "Password must be at least 8 characters" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validar el código
    const { data: validationData, error: validationError } = await supabase.rpc(
      'validate_reset_code',
      { p_code: code }
    );

    if (validationError || !validationData?.success) {
      console.error('Validation error:', validationError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: validationData?.error || 'Invalid or expired code' 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const userId = validationData.user_id;
    const userEmail = validationData.email;

    // Actualizar la contraseña del usuario
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update error:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update password' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Registrar en historial de email
    await supabase
      .from('email_history')
      .insert([{
        template_name: 'password_reset_success',
        recipient_email: userEmail,
        subject: 'Contraseña Actualizada - Muévete por el Caribe',
        status: 'sent'
      }]);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Password has been updated successfully'
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
