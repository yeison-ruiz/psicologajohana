import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && authData.user) {
      const session = authData.session;
      console.log('CALLBACK_DEBUG: Auth success for user:', authData.user.id);
      console.log('CALLBACK_DEBUG: session provider_token exists:', !!session?.provider_token);
      console.log('CALLBACK_DEBUG: session provider_refresh_token exists:', !!session?.provider_refresh_token);
      
      const ADMIN_EMAILS = ["carolinavillabon01@gmail.com", "ingyeisonruiz26@gmail.com"];
      const userEmail = authData.user.email?.toLowerCase();
      const isPsicologa = userEmail ? ADMIN_EMAILS.includes(userEmail) : false;

      // Check if this is a new user signup via Google
      const isNewUser = new Date(authData.user.created_at).getTime() > new Date().getTime() - 30000;
      
      if (isNewUser && !isPsicologa) {
        try {
          const { sendEmail } = await import("@/lib/email/send");
          await sendEmail("welcome", authData.user.email!, {
            patientName: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || "Paciente",
            loginUrl: `${origin}/login`
          });
        } catch (emailErr) {
          console.error("Welcome email (Google) failed:", emailErr);
        }
      }

      // If psicologa, store tokens for Meet integration
      if (isPsicologa && session?.provider_token) {
        const { createClient: createSupabaseAdmin } = await import('@supabase/supabase-js');
        const supabaseAdmin = createSupabaseAdmin(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Fetch existing to not overwrite refresh token with null
        const { data: existing } = await supabaseAdmin
          .from('psicologa_settings')
          .select('google_refresh_token')
          .eq('psicologa_id', authData.user.id)
          .single();

        const updates: {
          psicologa_id: string;
          google_access_token: string;
          google_token_expires_at: string | null;
          updated_at: string;
          google_refresh_token?: string;
        } = {
          psicologa_id: authData.user.id,
          google_access_token: session.provider_token,
          google_token_expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
          updated_at: new Date().toISOString()
        };

        // Only update refresh token if Google actually sent it
        if (session.provider_refresh_token) {
          updates.google_refresh_token = session.provider_refresh_token;
        } else if (existing?.google_refresh_token) {
          // Keep the old one if we don't have a new one
          updates.google_refresh_token = existing.google_refresh_token;
        }

        await supabaseAdmin
          .from('psicologa_settings')
          .upsert(updates, { onConflict: 'psicologa_id' });
      }
      
      const redirectPath = isPsicologa ? '/admin/dashboard' : next;
      
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate with Google`);
}
