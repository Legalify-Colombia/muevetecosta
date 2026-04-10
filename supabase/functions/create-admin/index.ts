import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateAdminRequest {
  full_name: string;
  email: string;
  document_number: string;
  phone?: string;
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
    // Verificar que solo admins pueden crear admins
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "No authorization header" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { full_name, email, document_number, phone }: CreateAdminRequest = await req.json();

    if (!full_name || !email || !document_number) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Generar contraseña temporal
    const temporaryPassword = `TempAdmin${Math.random().toString(36).substring(2, 10).toUpperCase()}!`;

    // Crear usuario en auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: false,
      user_metadata: {
        full_name,
        document_number,
        phone: phone || '',
        role: 'admin',
        document_type: 'cc'
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: authError.message }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!authData.user?.id) {
      return new Response(
        JSON.stringify({ success: false, error: "User creation failed" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Crear perfil manual en profiles tabla
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name,
        document_number,
        phone: phone || '',
        role: 'admin',
        document_type: 'cc'
      });

    if (profileError && profileError.code !== 'PGRST116') { // Ignorar si ya existe
      console.error('Profile error:', profileError);
      // Intentar actualizar si ya existe
      await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', authData.user.id);
    }

    // Obtener configuración de email
    const { data: emailConfig, error: configError } = await supabase
      .from('email_configuration')
      .select('*')
      .eq('is_active', true)
      .single();

    if (emailConfig?.resend_api_key) {
      const resend = new Resend(emailConfig.resend_api_key);
      
      const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${emailConfig.logo_url || 'https://mueveteporlacosta.com.co/logo.png'}" alt="Logo" style="max-width: 200px; height: auto;">
        </div>
        
        <h2 style="color: #333; text-align: center;">¡Bienvenido como Administrador!</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.5;">
          Has sido creado como administrador en el portal Muévete por el Caribe.
        </p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Contraseña Temporal:</strong> ${temporaryPassword}</p>
        </div>
        
        <p style="color: #d32f2f; font-size: 14px; font-weight: bold;">
          ⚠️ POR FAVOR CAMBIA TU CONTRASEÑA EN TU PRIMER INICIO DE SESIÓN
        </p>
        
        <p style="color: #666; font-size: 14px; line-height: 1.5; margin-top: 20px;">
          <a href="https://mueveteporlacosta.com.co/login" style="color: #1976d2; text-decoration: none;">
            Ir a la página de login
          </a>
        </p>
      </div>
      `;

      await resend.emails.send({
        from: emailConfig.default_sender_email,
        to: [email],
        subject: 'Credenciales de Administrador - Muévete por el Caribe',
        html: htmlContent,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Administrator created successfully',
        userId: authData.user.id,
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
