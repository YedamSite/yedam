import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').split(/[\r\n]+/)[0];

export async function POST(req: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();
    const { profileData, isNewRegistration } = body;

    if (!profileData || typeof profileData !== 'object') {
      return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 });
    }

    const authHeader = req.headers.get('Authorization');
    let userId = profileData.id;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (!authError && user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized or missing user ID' }, { status: 401 });
    }

    const safeData = { ...profileData, id: userId };

    if (isNewRegistration && (!authHeader || !authHeader.startsWith('Bearer '))) {
      // For new registrations without a session (e.g. email confirmation required),
      // we only allow INSERT to prevent overwriting existing profiles.
      const { error: insertError } = await supabase
        .from('cheotnun_users')
        .insert([safeData]);
        
      if (insertError && insertError.code !== '23505') { // Ignore unique violation if they retry
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    // Authenticated updates
    const { error: upsertError } = await supabase
      .from('cheotnun_users')
      .upsert([safeData], { onConflict: 'id', ignoreDuplicates: false });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
