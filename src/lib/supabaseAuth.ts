import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock list of fallback users matching the seed database
const MOCK_USERS_YEDAM = [
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', email: 'admin@yedam.com', name: 'Super Administrador Yedam', role: 'super_admin' },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', email: 'cliente@example.com', name: 'Jaque Customer', role: 'customer' }
];

// Auth listener on client side to sync session to localStorage
if (typeof window !== 'undefined' && supabase) {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const email = session.user.email || '';
      
      const saved = localStorage.getItem('yedam_session');
      const currentUser = saved ? JSON.parse(saved) : null;
      
      if (!currentUser || currentUser.id !== session.user.id) {
        // Fetch profile from yedam_users database table
        const { data: dbUser } = await supabase
          .from('yedam_users')
          .select('name, role')
          .eq('id', session.user.id)
          .single();

        const name = dbUser?.name || session.user.user_metadata?.name || email.split('@')[0];
        const role = dbUser?.role || session.user.user_metadata?.role || 'customer';

        localStorage.setItem('yedam_session', JSON.stringify({
          id: session.user.id,
          email,
          name,
          role
        }));
      }
    } else if (event === 'SIGNED_OUT') {
      localStorage.removeItem('yedam_session');
    }
  });
}

export const authService = {
  async signUp(email: string, name: string, role: string = 'customer') {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'password123',
        options: {
          data: { name, role }
        }
      });
      if (error) throw error;

      if (data.user) {
        // Insert user record in yedam_users to maintain foreign key integrity
        const { error: dbError } = await supabase
          .from('yedam_users')
          .insert({
            id: data.user.id,
            email,
            name,
            role: role as any
          });
        if (dbError) {
          console.error('Error inserting user profile in database:', dbError);
        }

        localStorage.setItem('yedam_session', JSON.stringify({
          id: data.user.id,
          email,
          name,
          role
        }));
      }
      return data;
    } else {
      // Local fallback simulation
      const newUser = { id: crypto.randomUUID(), email, name, role };
      localStorage.setItem('yedam_session', JSON.stringify(newUser));
      return { user: newUser };
    }
  },

  async signIn(email: string) {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'password123'
      });
      if (error) throw error;

      if (data.user) {
        const { data: dbUser } = await supabase
          .from('yedam_users')
          .select('name, role')
          .eq('id', data.user.id)
          .single();

        const name = dbUser?.name || data.user.user_metadata?.name || email.split('@')[0];
        const role = dbUser?.role || data.user.user_metadata?.role || 'customer';

        localStorage.setItem('yedam_session', JSON.stringify({
          id: data.user.id,
          email,
          name,
          role
        }));
      }
      return data;
    } else {
      // Local fallback search matching seed list
      const matched = MOCK_USERS_YEDAM.find(u => u.email.toLowerCase() === email.toLowerCase());
      const userSession = matched || { id: crypto.randomUUID(), email, name: email.split('@')[0], role: 'customer' };
      localStorage.setItem('yedam_session', JSON.stringify(userSession));
      return { user: userSession };
    }
  },

  async signInWithGoogle() {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return data;
    } else {
      // Local fallback simulator for Google OAuth button
      const googleUser = { id: crypto.randomUUID(), email: 'google.user@gmail.com', name: 'Google Client User', role: 'customer' };
      localStorage.setItem('yedam_session', JSON.stringify(googleUser));
      return { user: googleUser };
    }
  },

  async signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('yedam_session');
  },

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('yedam_session');
    return saved ? JSON.parse(saved) : null;
  }
};

