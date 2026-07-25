import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { type, value } = await req.json();
    
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
      // Set admin session cookie
      cookieStore.set('cheotnun_admin_session', 'true', {
        ...cookieOptions,
        maxAge: 7200, // 2 hours
      });
      return NextResponse.json({ success: true });
    } 
    
    if (type === 'client') {
      // Set client session cookie
      cookieStore.set('cheotnun_session', encodeURIComponent(JSON.stringify(value)), {
        ...cookieOptions,
        maxAge: 86400, // 24 hours
      });
      return NextResponse.json({ success: true });
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
