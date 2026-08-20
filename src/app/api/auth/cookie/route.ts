import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { type, value, access_token } = await req.json();
    
    if (!type) {
      return NextResponse.json({ error: 'Missing cookie type' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    if (type === 'admin') {
      if (!access_token) {
        return NextResponse.json({ error: 'Unauthorized: missing token' }, { status: 401 });
      }

      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
      }
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Verify the JWT token
      const { data: { user }, error } = await supabase.auth.getUser(access_token);
      
      if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized: invalid token' }, { status: 401 });
      }

      const adminEmails = ['admin@cheotnun.com', 'mauemglobal@gmail.com'];
      if (!user.email || !adminEmails.includes(user.email)) {
        return NextResponse.json({ error: 'Forbidden: not an admin' }, { status: 403 });
      }

      // Set admin session cookie
      const response = NextResponse.json({ success: true });
      response.cookies.set('cheotnun_admin_session', 'true', {
        ...cookieOptions,
        maxAge: 604800, // 7 days
      });
      return response;
    } 
    
    if (type === 'client') {
      // Set client session cookie
      const response = NextResponse.json({ success: true });
      response.cookies.set('cheotnun_session', encodeURIComponent(JSON.stringify(value)), {
        ...cookieOptions,
        maxAge: 86400, // 24 hours
      });
      return response;
    }

    return NextResponse.json({ error: 'Invalid cookie type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { type } = await req.json();
    const cookieStore = await cookies();

    if (type === 'admin') {
      cookieStore.delete('cheotnun_admin_session');
      return NextResponse.json({ success: true });
    }
    
    if (type === 'client') {
      cookieStore.delete('cheotnun_session');
      return NextResponse.json({ success: true });
    }

    // Default: delete both
    cookieStore.delete('cheotnun_admin_session');
    cookieStore.delete('cheotnun_session');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
