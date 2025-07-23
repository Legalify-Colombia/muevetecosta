import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GetCoordinatorEmailRequest {
  coordinatorId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { coordinatorId }: GetCoordinatorEmailRequest = await req.json();

    if (!coordinatorId) {
      return new Response(JSON.stringify({ error: 'Coordinator ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get coordinator's email from auth.users table
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(coordinatorId);

    if (authError) {
      console.error('Error fetching coordinator auth info:', authError);
      return new Response(JSON.stringify({ error: 'Failed to get coordinator auth info' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get coordinator's profile info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', coordinatorId)
      .single();

    if (profileError) {
      console.error('Error fetching coordinator profile:', profileError);
      return new Response(JSON.stringify({ error: 'Failed to get coordinator profile' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      coordinator: {
        email: user?.email || null,
        fullName: profile?.full_name || null
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in get-coordinator-email function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);